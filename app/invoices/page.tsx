import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ExpandableInvoiceCard from "./expandableInvoiceCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import NewInvoiceForm from "./newInvoiceForm";
import { InvoiceDetail } from "../types/invoiceDetail";
import { createClient } from '@/utils/supabase/client';
import { PostgrestResponse } from "@supabase/supabase-js"

export default async function Page() {
  const supabase = await createClient();

    const { data }:PostgrestResponse<InvoiceDetail> = await supabase
    .from("invoices")
    .select('*')
    .order("InvoiceId", {ascending: false})
    
    const allInvoiceDetail = data || [];
    const annualInvoiceDetail = data?.filter(x => x.MemberSubscriptionType === "Annual") || [];
    const monthlyInvoiceDetail = data?.filter(x => x.MemberSubscriptionType === "Monthly") || [];
    const casualInvoiceDetail = data?.filter(x => x.MemberSubscriptionType === "Casual") || [];


  return (
    <div className="w-screen container mx-auto">
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
          <ExpandableInvoiceCard invoiceDetails={allInvoiceDetail} memberInvoiceDetails={null}/>
        </TabsContent>        
        <TabsContent value="Casual">
          <ExpandableInvoiceCard invoiceDetails={casualInvoiceDetail} memberInvoiceDetails={null}/>
        </TabsContent>
        <TabsContent value="Annual">
          <ExpandableInvoiceCard invoiceDetails={annualInvoiceDetail} memberInvoiceDetails={null}/>
        </TabsContent>
        <TabsContent value="Monthly">
          <ExpandableInvoiceCard invoiceDetails={monthlyInvoiceDetail} memberInvoiceDetails={null}/>
        </TabsContent>
      </Tabs>
    </div>
  );
}