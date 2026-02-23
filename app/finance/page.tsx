import { AppSidebar } from "@/components/app-sidebar";
import MonthlyOverview from "./monthlyOverview";
import SummaryOfEvents from "./SummaryOfEvents";
import YearSelect from "./yearSelect";
import { SidebarProvider } from "@/components/ui/sidebar";
import AddExpense from "./addExpense";

export default async function FinancePage({ searchParams }: { searchParams?: Promise<{ year?: string }> }) {
  const params = await searchParams; 
  const currentYear = new Date().getFullYear();
  const selectedYear = Number(params?.year) || currentYear;

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Club Finances - {selectedYear}</h1>

          {/* Year select + Add Expense button */}
          <div className="flex items-center space-x-2">
            <YearSelect currentYear={selectedYear} />
            <AddExpense/>
          </div>
        </div>

        <MonthlyOverview year={selectedYear} />
        <SummaryOfEvents year={selectedYear} />
      </div>
    </SidebarProvider>
  );
}