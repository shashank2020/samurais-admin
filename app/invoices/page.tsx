import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ExpandableInvoiceCard from "./expandableInvoiceCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import NewInvoiceForm from "./newInvoiceForm";

export default async function Page() {
  return (
    <div className="w-screen container mx-auto">
      <Tabs defaultValue="All">
        <div className="flex justify-between mb-4">
          <TabsList>
            <TabsTrigger value="All">All</TabsTrigger>
            <TabsTrigger value="Annual">Annual</TabsTrigger>
            <TabsTrigger value="Monthly">Monthly</TabsTrigger>
            <TabsTrigger value="Weekly">Weekly</TabsTrigger>
            <TabsTrigger value="Casual">Casual</TabsTrigger>
          </TabsList>
          <NewInvoiceForm/>
        </div>
        <TabsContent value="All">
          <ExpandableInvoiceCard invoiceDetails={"All"} memberInvoiceDetails={null}/>
        </TabsContent>
        <TabsContent value="Annual">
          <ExpandableInvoiceCard invoiceDetails={"Annual"} memberInvoiceDetails={null}/>
        </TabsContent>
        <TabsContent value="Monthly">
          <ExpandableInvoiceCard invoiceDetails={"Monthly"} memberInvoiceDetails={null}/>
        </TabsContent>
        <TabsContent value="Weekly">
          <ExpandableInvoiceCard invoiceDetails={"Weekly"} memberInvoiceDetails={null}/>
        </TabsContent>
        <TabsContent value="Casual">
          <ExpandableInvoiceCard invoiceDetails={"Casual"} memberInvoiceDetails={null}/>
        </TabsContent>
      </Tabs>
    </div>
  );
}