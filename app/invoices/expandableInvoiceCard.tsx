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

type ExpandableInvoiceCardProps = { invoiceDetails: string, memberInvoiceDetails: null  };
  
export default function ExpandableInvoiceCard({invoiceDetails, memberInvoiceDetails} : ExpandableInvoiceCardProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="monthly-invoice">
        <AccordionTrigger>
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {invoiceDetails} Invoice - May 2025
                <Badge variant="outline">3 Members</Badge>
              </CardTitle>
            </CardHeader>
          </Card>
        </AccordionTrigger>
        <AccordionContent>
          <CardContent>
            <div className="space-y-4">
              {["Alice", "Bob", "Charlie"].map((name) => (
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
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
