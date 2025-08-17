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
import { InvoiceWithMemberDetails } from "../types/invoiceDetail";
import { Download, Plus, Send } from "lucide-react";
import InvoiceEmailForm from "./invoiceEmailForm";
import { useMarkMemberInvoiceAsPaid } from "../invoiceModulation/useMarkMemberInvoiceAsPaid";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

type ExpandableInvoiceCardProps = {invoiceWithMemberDetails: InvoiceWithMemberDetails[] };


export default function ExpandableInvoiceCard({ invoiceWithMemberDetails} : ExpandableInvoiceCardProps) {
const router = useRouter();
const handleDownload = () => {
  window.open('/api/invoice/download', '_blank')
}

const { toast } = useToast();
  
const {
      mutate: markMemberInvoiceAsPaid,
      isPending: isUpdating,
    } = useMarkMemberInvoiceAsPaid();

const markUserAsPaid = (memberInvoiceId: number) => {
  // Logic to mark user as paid
  markMemberInvoiceAsPaid(memberInvoiceId, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Member invoice marked as paid successfully",
            variant: "default",
          });
          router.refresh();
        },
        onError: (error: any) => {
          alert("Error updating invoice notification status: " + error.message);
        },
      });
}

  return ( invoiceWithMemberDetails && invoiceWithMemberDetails.length > 0 ? (
    <Accordion type="single" collapsible className="w-full">
      {invoiceWithMemberDetails.map((invoiceWithMemberDetail) => (
        <AccordionItem key={invoiceWithMemberDetail.invoice.InvoiceId} value={`invoice-${invoiceWithMemberDetail.invoice.InvoiceId}`}>
        <AccordionTrigger>
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <div className="flex flex-row items-center gap-4">
                  <span className="text-lg font-semibold">
                    {invoiceWithMemberDetail.invoice.MemberSubscriptionType} Invoice #{invoiceWithMemberDetail.invoice.InvoiceId}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(invoiceWithMemberDetail.invoice.StartDate).toLocaleDateString("en-NZ")} -{" "}
                    {new Date(invoiceWithMemberDetail.invoice.DueDate).toLocaleDateString("en-NZ")}
                  </span>
                </div>
                <div className="flex items-center gap-2 ml-auto">    
                  <Badge variant="outline">
                    {invoiceWithMemberDetail.memberDetails.length} Member{invoiceWithMemberDetail.memberDetails.length > 1 ? "s" : ""}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>
        </AccordionTrigger>
        <AccordionContent>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-end gap-2">
                <InvoiceEmailForm members={invoiceWithMemberDetail.memberDetails} invoiceId={invoiceWithMemberDetail.invoice.InvoiceId} />
                <Button size="sm" variant="secondary">
                  Assign Members <Plus />
                </Button>
                <Button size="sm" variant="secondary" onClick={handleDownload}>
                  Download <Download />
                </Button>
              </div>
              {invoiceWithMemberDetail.memberDetails.map((member) => (
                <div
                  key={member.Id}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <span>{member.GivenName}</span>
                    <div className="flex items-center gap-2">
                    <Button size="sm" variant={invoiceWithMemberDetail.MemberInvoiceDetails?.some(mInv => mInv.MemberId === member.Id && mInv.IsPaid) ? "outline" : "destructive"} onClick={invoiceWithMemberDetail.MemberInvoiceDetails?.some(mInv => mInv.MemberId === member.Id && mInv.IsPaid) ? undefined : () => {
                      const memberInvoiceDetail = invoiceWithMemberDetail.MemberInvoiceDetails?.find(mInv => mInv.MemberId === member.Id);
                      if (memberInvoiceDetail) {
                        markUserAsPaid(memberInvoiceDetail.MemberInvoiceId);
                      }
                    }}>
                      {invoiceWithMemberDetail.MemberInvoiceDetails?.some(mInv => mInv.MemberId === member.Id && mInv.IsPaid) ? 'Paid' : 'Mark as Paid'}
                    </Button>
                    <Badge variant={invoiceWithMemberDetail.MemberInvoiceDetails?.some(mInv => mInv.MemberId === member.Id && mInv.IsNotified) ? "secondary" : "destructive"} className={invoiceWithMemberDetail.MemberInvoiceDetails?.some(mInv => mInv.MemberId === member.Id && mInv.IsNotified) ? "bg-blue-500 text-white dark:bg-green-600" : ""}>
                      {invoiceWithMemberDetail.MemberInvoiceDetails?.some(mInv => mInv.MemberId === member.Id && mInv.IsNotified) ? "Invoice sent" : "Not sent"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </AccordionContent>
      </AccordionItem>
    ))}
    </Accordion>
  ): (
    <div className="text-center py-4">
      <p>No invoice details available</p>
    </div>
  ));
}
