import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { createClient } from "@/utils/supabase/server";

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get("year"));
  const supabase = await createClient();

  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  // ----------------------
  // FETCH DATA
  // ----------------------

  const { data: balanceRow } = await supabase
    .from("club_year_balances")
    .select("StartingBalance")
    .eq("Year", year)
    .single();

  const startingBalance = Number(balanceRow?.StartingBalance ?? 0);

  // Member invoice income
  const { data: incomeRows } = await supabase
    .from("member_invoice_details")
    .select("Amount, DatePaid")
    .eq("IsPaid", true)
    .gte("DatePaid", startDate)
    .lte("DatePaid", endDate);

  // Unified transactions (income + expense)
  const { data: transactionRows } = await supabase
    .from("club_transactions")
    .select("Amount, TransactionDate, Type, Title")
    .gte("TransactionDate", startDate)
    .lte("TransactionDate", endDate);

  // ----------------------
  // MONTHLY OVERVIEW
  // ----------------------

  const months = Array.from({ length: 12 }, (_, i) => ({
    Month: monthNames[i],
    Income: 0,
    Expense: 0,
    Net: 0,
    RunningBalance: 0,
  }));

  // Member income
  incomeRows?.forEach(row => {
    if (!row.DatePaid) return;
    const m = new Date(row.DatePaid).getMonth();
    months[m].Income += Number(row.Amount);
  });

  // Transactions (income + expense)
  transactionRows?.forEach(row => {
    const m = new Date(row.TransactionDate).getMonth();

    if (row.Type === "expense") {
      months[m].Expense += Number(row.Amount);
    } else if (row.Type === "income") {
      months[m].Income += Number(row.Amount);
    }
  });

  let running = startingBalance;
  months.forEach(m => {
    m.Net = m.Income + m.Expense;
    running += m.Net;
    m.RunningBalance = running;
  });

  const totals = {
    Month: "TOTAL",
    Income: months.reduce((s, m) => s + m.Income, 0),
    Expense: months.reduce((s, m) => s + m.Expense, 0),
    Net: months.reduce((s, m) => s + m.Net, 0),
    RunningBalance: months[months.length - 1].RunningBalance,
  };

  const monthlyData = [...months, totals];

  // ----------------------
  // EVENTS
  // ----------------------

  const { data: incomeInvoices } = await supabase
    .from("member_invoice_details")
    .select("MemberInvoiceId, DatePaid, Amount, MemberId, InvoiceId")
    .eq("IsPaid", true)
    .gte("DatePaid", startDate)
    .lte("DatePaid", endDate);

  const { data: members } = await supabase
    .from("member_details_table")
    .select("Id, GivenName");

  const { data: invoices } = await supabase
    .from("invoices")
    .select("InvoiceId, MemberSubscriptionType, PeriodKey");

  const { data: transactionEvents } = await supabase
    .from("club_transactions")
    .select("TransactionDate, Title, Amount, Type")
    .gte("TransactionDate", startDate)
    .lte("TransactionDate", endDate);

  const events = [
    // Member payments
    ...(incomeInvoices || []).map(invoice => {
      const member = members?.find(m => m.Id === invoice.MemberId);
      const inv = invoices?.find(i => i.InvoiceId === invoice.InvoiceId);

      return {
        Date: new Date(invoice.DatePaid).toLocaleDateString(),
        Description: `Membership (${inv?.MemberSubscriptionType || "N/A"} - ${inv?.PeriodKey || "N/A"}) - ${member?.GivenName || ""}`,
        Type: "Income",
        Amount: Number(invoice.Amount),
      };
    }),

    // Transactions (income + expense)
    ...(transactionEvents || []).map(t => ({
      Date: new Date(t.TransactionDate).toLocaleDateString(),
      Description: t.Title,
      Type: t.Type === "expense" ? "Expense" : "Income",
      Amount: Number(t.Amount),
    })),
  ].sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());

  // ----------------------
  // CREATE WORKBOOK
  // ----------------------

  const wb = XLSX.utils.book_new();

  /* =========================
     📄 SHEET 1: REPORT
  ========================= */

  const ws = XLSX.utils.aoa_to_sheet([]);

  XLSX.utils.sheet_add_aoa(ws, [
    [`Club Finances Report - ${year}`],
    [],
    [`Starting Balance`, startingBalance],
    [],
    ["Monthly Overview"],
  ], { origin: "A1" });

  XLSX.utils.sheet_add_aoa(ws, [[
    "Month", "Income", "Expense", "Net", "Running Balance"
  ]], { origin: "A6" });

  const tableData = monthlyData.map(m => [
    m.Month,
    m.Income,
    m.Expense,
    m.Net,
    m.RunningBalance
  ]);

  XLSX.utils.sheet_add_aoa(ws, tableData, { origin: "A7" });

  ws["!cols"] = [
    { wch: 12 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 },
  ];

  for (let r = 6; r < 6 + monthlyData.length; r++) {
    ["B", "C", "D", "E"].forEach(col => {
      const cell = ws[`${col}${r + 1}`];
      if (cell) cell.z = "$0.00";
    });
  }

  ["A6","B6","C6","D6","E6"].forEach(cell => {
    if (ws[cell]) {
      ws[cell].s = { font: { bold: true } };
    }
  });

  const totalRowIndex = 6 + monthlyData.length;
  ["A","B","C","D","E"].forEach(col => {
    const cell = ws[`${col}${totalRowIndex}`];
    if (cell) {
      cell.s = { font: { bold: true } };
    }
  });

  XLSX.utils.book_append_sheet(wb, ws, "Report");

  /* =========================
     📄 SHEET 2: EVENTS
  ========================= */

  const ws2 = XLSX.utils.aoa_to_sheet([
    ["Summary of Events"],
    [],
    ["Date", "Description", "Type", "Amount"],
  ]);

  const eventRows = events.map(e => [
    e.Date,
    e.Description,
    e.Type,
    e.Amount
  ]);

  XLSX.utils.sheet_add_aoa(ws2, eventRows, { origin: "A4" });

  ws2["!cols"] = [
    { wch: 12 },
    { wch: 50 },
    { wch: 12 },
    { wch: 15 },
  ];

  for (let r = 3; r < 3 + events.length; r++) {
    const cell = ws2[`D${r + 1}`];
    if (cell) cell.z = "$0.00";
  }

  XLSX.utils.book_append_sheet(wb, ws2, "Events");

  /* =========================
     🚀 EXPORT
  ========================= */

  const buffer = XLSX.write(wb, {
    type: "buffer",
    bookType: "xlsx",
  });

  return new NextResponse(buffer, {
    headers: {
      "Content-Disposition": `attachment; filename=finance-report-${year}.xlsx`,
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });
}