'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Send } from "lucide-react";
import InvoiceEmailForm from "./invoiceEmailForm";
import { InvoiceWithMemberDetails } from "../types/invoiceDetail";

type Props = {
  invoiceWithMemberDetails: InvoiceWithMemberDetails[];
};

export default function InvoiceCards({ invoiceWithMemberDetails }: Props) {
  const handleDownload = () => {
    window.open('/api/invoice/download', '_blank');
  };

  if (!invoiceWithMemberDetails?.length) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No invoice details available
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {invoiceWithMemberDetails.map(({ invoice, memberDetails, MemberInvoiceDetails }) => {
        const totalMembers = memberDetails.length;
        const paidMembers =
          MemberInvoiceDetails?.filter(m => m.IsPaid).length ?? 0;

        const progress = Math.round((paidMembers / totalMembers) * 100);
        const isFullyPaid = paidMembers === totalMembers;

        return (
          <Card key={invoice.InvoiceId}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">
                  {invoice.PeriodKey} {" "}
                  {invoice.MemberSubscriptionType}
                </CardTitle>

                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {paidMembers}/{totalMembers} paid
                  </Badge>

                    <Badge variant={isFullyPaid ? "default" : "destructive"} className={isFullyPaid ? "bg-green-600 hover:bg-green-700 text-white" : ""}>
                    {isFullyPaid ? "Fully paid" : "In progress"}
                    </Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <InvoiceEmailForm
                  members={memberDetails.map(m => ({
                    ...m,
                    isNotified: MemberInvoiceDetails?.some(
                      inv => inv.MemberId === m.Id && inv.IsNotified
                    ) ?? false,
                  }))}
                  invoiceId={invoice.InvoiceId}
                  publicUrl={invoice.PublicUrl || ""}
                />
              </div>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
}
