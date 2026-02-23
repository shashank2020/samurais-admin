import { createClient } from "@/utils/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type MonthData = {
  month: number;
  income: number;
  expense: number;
  net: number;
  runningBalance: number;
};

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export default async function MonthlyOverview({ year }: { year: number }) {
  const supabase = await createClient();
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  // Starting Balance
  const { data: balanceRow } = await supabase
    .from("club_year_balances")
    .select("StartingBalance")
    .eq("Year", year)
    .single();
  const startingBalance = Number(balanceRow?.StartingBalance ?? 0);

  // Income & Expenses
  const { data: incomeRows } = await supabase
    .from("member_invoice_details")
    .select("Amount, DatePaid")
    .eq("IsPaid", true)
    .gte("DatePaid", startDate)
    .lte("DatePaid", endDate);

  const { data: expenseRows } = await supabase
    .from("club_expenses")
    .select("Amount, ExpenseDate")
    .gte("ExpenseDate", startDate)
    .lte("ExpenseDate", endDate);

  // Initialize months
  const months: MonthData[] = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    income: 0,
    expense: 0,
    net: 0,
    runningBalance: 0,
  }));

  // Group Income
  incomeRows?.forEach(row => {
    if (!row.DatePaid) return;
    const monthIndex = new Date(row.DatePaid).getMonth();
    months[monthIndex].income += Number(row.Amount);
  });

  // Group Expenses
  expenseRows?.forEach(row => {
    const monthIndex = new Date(row.ExpenseDate).getMonth();
    months[monthIndex].expense += Number(row.Amount);
  });

  // Net + Running Balance
  let running = startingBalance;
  months.forEach(m => {
    m.net = m.income - m.expense;
    running += m.net;
    m.runningBalance = running;
  });

  return (
    <Card className="w-full hover:bg-transparent">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Monthly Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md overflow-auto">
          <table className="w-full border-collapse text-sm table-fixed">
            <thead className="bg-background sticky top-0 z-30">
              <tr className="border-b">
                <th className="sticky left-0 z-20 px-4 py-3 font-medium text-left w-[100px]">Month</th>
                <th className="px-4 py-3 text-center font-medium">Income</th>
                <th className="px-4 py-3 text-center font-medium">Expense</th>
                <th className="px-4 py-3 text-center font-medium">Net</th>
                <th className="px-4 py-3 text-center font-medium">Running Balance</th>
              </tr>
            </thead>
            <tbody>
              {months.map(m => (
                <tr key={m.month} className="border-b text-center">
                  <td className="sticky left-0 z-10 bg-background px-4 py-3 font-medium">{monthNames[m.month - 1]}</td>
                  <td className="px-4 py-3">${m.income.toFixed(2)}</td>
                  <td className="px-4 py-3">${m.expense.toFixed(2)}</td>
                  <td className={`px-4 py-3 ${m.net >= 0 ? "text-green-600" : "text-red-600"}`}>${m.net.toFixed(2)}</td>
                  <td className={`px-4 py-3 ${m.runningBalance >= 0 ? "text-green-600" : "text-red-600"}`}>${m.runningBalance.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}