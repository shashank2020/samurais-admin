import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ExpandableInvoiceCard from "./expandableInvoiceCard";
import NewInvoiceForm from "./newInvoiceForm";
import { InvoiceDetail, InvoiceWithMemberDetails, MemberInvoiceDetail } from "../types/invoiceDetail";
import { createClient } from '@/utils/supabase/client';
import { PostgrestResponse } from "@supabase/supabase-js"
import { Member } from "../types/member";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default async function Page() {
  const supabase = await createClient();

    const { data: invoiceData }:PostgrestResponse<InvoiceDetail> = await supabase
    .from("invoices")
    .select('*')
    .order("InvoiceId", {ascending: false})

    const { data: memberInvoiceData }:PostgrestResponse<MemberInvoiceDetail> = await supabase
    .from("member_invoice_details")
    .select('*') 

    const { data: memberData }:PostgrestResponse<Member> = await supabase
    .from("member_details_table")
    .select("*")
    .eq("Status", 1)

    // Combine invoiceData, memberInvoiceData, and memberData into invoiceWithMemberDetails arrays
    function getInvoiceWithMemberDetails(type?: string) {
      if (!invoiceData || !memberInvoiceData || !memberData) return [];
      return invoiceData
        .filter(inv => !type || inv.MemberSubscriptionType === type)
        .map(inv => {
          // Find all members whose Id is in inv.MemberIds array
          const members = memberData.filter(m => memberInvoiceData.some(mInv => mInv.MemberId === m.Id && mInv.InvoiceId === inv.InvoiceId));
          return {
            invoice: inv,
            memberDetails: members,
            MemberInvoiceDetails: memberInvoiceData.filter(mInv => mInv.InvoiceId === inv.InvoiceId)
          } as InvoiceWithMemberDetails;
        });
    }

    const allInvoiceMemberDetails = getInvoiceWithMemberDetails();
    const casualInvoiceMemberDetails = getInvoiceWithMemberDetails("Casual");
    const annualInvoiceMemberDetails = getInvoiceWithMemberDetails("Annual");
    const monthlyInvoiceMemberDetails = getInvoiceWithMemberDetails("Monthly");

  return (
    <SidebarProvider>
      <AppSidebar />      
        {/* <SidebarTrigger /> */}
        {/* <SidebarInset> */}
        <div className="container mx-auto px-4">
          <Tabs defaultValue="All">
            <div className="flex justify-between mb-4">
              <TabsList>
                <TabsTrigger value="All">All</TabsTrigger>
                <TabsTrigger value="Annual">Annual</TabsTrigger>
                <TabsTrigger value="Monthly">Monthly</TabsTrigger>
                <TabsTrigger value="Casual">Casual</TabsTrigger>
              </TabsList>
              <NewInvoiceForm/>
            </div>
            <TabsContent value="All">
              <ExpandableInvoiceCard invoiceWithMemberDetails={allInvoiceMemberDetails}/>
            </TabsContent>        
            <TabsContent value="Casual">
              <ExpandableInvoiceCard invoiceWithMemberDetails={casualInvoiceMemberDetails}/>
            </TabsContent>
            <TabsContent value="Annual">
              <ExpandableInvoiceCard invoiceWithMemberDetails={annualInvoiceMemberDetails}/>
            </TabsContent>
            <TabsContent value="Monthly">
              <ExpandableInvoiceCard invoiceWithMemberDetails={monthlyInvoiceMemberDetails}/>
            </TabsContent>
          </Tabs>
        </div>
    </SidebarProvider>
  );
}