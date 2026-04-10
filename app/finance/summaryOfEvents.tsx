
import { createClient } from "@/utils/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import TransactionRowActions from "./transactionRowActions";
import IncomeRowActions from "./incomeRowActions";

export default async function SummaryOfEvents({ year }: { year: number }) {
  const supabase = await createClient();
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  // Fetch paid invoices
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
    .select("TransactionId, TransactionDate, Title, Amount")
    .gte("TransactionDate", startDate)
    .lte("TransactionDate", endDate);

  const events = [
    ...(incomeInvoices || []).map(invoice => {
      const member = members?.find(m => m.Id === invoice.MemberId);
      const inv = invoices?.find(i => i.InvoiceId === invoice.InvoiceId);

      return {
        id: invoice.MemberInvoiceId,
        date: invoice.DatePaid,
        description: `Membership (${inv?.MemberSubscriptionType || "N/A"} - ${inv?.PeriodKey || "N/A"}) - ${member?.GivenName || ""}`,
        amount: Number(invoice.Amount) || 0,
        type: "income",
        source: "invoice",
      };
    }),

    ...(transactionEvents || []).map(t => ({
      id: t.TransactionId,
      date: t.TransactionDate,
      description: t.Title || "",
      amount: Math.abs(Number(t.Amount)) || 0,
      type: Number(t.Amount) >= 0 ? "income" : "expense",
      source: "transaction",
    })),
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Card className="w-full hover:bg-transparent">
      <CardHeader>
        <CardTitle>Summary of Events</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 border rounded-md">
        <ScrollArea className="h-[420px]">
          <table className="w-full border-collapse text-sm table-fixed">
            <tbody>
              {events.map((e, i) => (
                <tr key={i} className="border-b">
                  <td className="px-4 py-2">{new Date(e.date).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{e.description}</td>
                  <td className={`px-4 py-2 text-right ${e.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    {e.type === "income" ? "+" : "-"}${e.amount.toFixed(2)}
                  </td>
                  <td className="px-2 py-2 text-right">
                    {e.source === "transaction" && (
                        <TransactionRowActions transactionId={e.id} />
                        )}

                        {e.source === "invoice" && (
                        <IncomeRowActions
                            memberInvoiceId={e.id}
                            date={e.date}
                            description={e.description}
                            amount={e.amount}
                        />
                        )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}