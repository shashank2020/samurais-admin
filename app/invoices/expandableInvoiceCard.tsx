'use client'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import { Badge } from "@/components/ui/badge";
  import { Button } from "@/components/ui/button";
import { InvoiceDetail } from "../types/invoiceDetail";

type ExpandableInvoiceCardProps = { invoiceDetails: InvoiceDetail[], memberInvoiceDetails: null  };
  
export default function ExpandableInvoiceCard({invoiceDetails, memberInvoiceDetails} : ExpandableInvoiceCardProps) {

  return (
    <Accordion type="single" collapsible className="w-full">
      {invoiceDetails.map((invoice) => (
        <AccordionItem key={invoice.InvoiceId} value={`invoice-${invoice.InvoiceId}`}>
        <AccordionTrigger>
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <div className="flex flex-row items-center gap-4">
                  <span className="text-lg font-semibold">
                    {invoice.MemberSubscriptionType} Invoice #{invoice.InvoiceId}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(invoice.StartDate).toLocaleDateString("en-NZ")} -{" "}
                    {new Date(invoice.DueDate).toLocaleDateString("en-NZ")}
                  </span>
                </div>
                <Badge variant="outline">3 Members</Badge>
              </CardTitle>
            </CardHeader>
          </Card>
        </AccordionTrigger>
        <AccordionContent>
          <CardContent>
            <div className="space-y-4">
              {["Alice"].map((name) => (
                <div
                  key={name}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <span>{name}</span>
                  <Button size="sm" variant="outline">
                    Mark as Paid
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
          <div className="flex justify-center mt-1">
            <Button>
              Assign Members
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    ))}
    </Accordion>
  );
}
