import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { createClient } from "@/utils/supabase/client";
import { InvoiceDetail } from "../types/invoiceDetail";
import { PostgrestResponse } from "@supabase/supabase-js";
import { SectionCards } from "@/components/section-cards"
import { DataTable } from "@/components/ui/data-table";

export default async function Page() {
  
  const supabase = await createClient();
  
      const { data: invoiceData }:PostgrestResponse<InvoiceDetail> = await supabase
      .from("invoices")
      .select('*')
      .order("InvoiceId", {ascending: false})
      
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="container mx-auto px-4 flex-1">
      <SectionCards />
      {/* <DataTable data={invoiceData || []} columns={[]} /> */}
      </div>
    </SidebarProvider>
  )
}