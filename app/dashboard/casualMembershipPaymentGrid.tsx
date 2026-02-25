"use client"

import * as React from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useMarkMemberInvoiceAsPaid } from "../invoiceModulation/useMarkMemberInvoiceAsPaid"
import { useState } from "react"

type CasualMember = {
  memberInvoiceId: number
  memberId: number
  name: string
  isPaid: boolean
}

type CasualInvoice = {
  invoiceId: number
  periodKey: string
  members: CasualMember[]
}

interface Props {
  casualInvoices: CasualInvoice[]
}

export function CasualMembershipPaymentGrid({
  casualInvoices,
}: Props) {
  const { toast } = useToast()
  const { mutate: markMemberPaid } = useMarkMemberInvoiceAsPaid()

  const [localInvoices, setLocalInvoices] =
    React.useState(casualInvoices)
  const [openInvoiceId, setOpenInvoiceId] = useState<number | null>(null);
  
  const handleMarkPaid = (
    invoiceId: number,
    memberInvoiceId: number
  ) => {
    markMemberPaid(memberInvoiceId, {
      onSuccess: () => {
        toast({
          title: "Invoice marked as paid",
        })

        setLocalInvoices((prev) =>
          prev.map((invoice) => {
            if (invoice.invoiceId !== invoiceId) return invoice

            return {
              ...invoice,
              members: invoice.members.map((m) =>
                m.memberInvoiceId === memberInvoiceId
                  ? { ...m, isPaid: true }
                  : m
              ),
            }
          })
        )
      },
    })
  }

  const sortedInvoices = [...localInvoices].sort((a, b) => {
  const aAllPaid = a.members.every((m) => m.isPaid);
  const bAllPaid = b.members.every((m) => m.isPaid);

  // If one is fully paid and the other isn't, push fully paid to bottom
  if (aAllPaid !== bAllPaid) {
    return aAllPaid ? 1 : -1;
  }

  // Otherwise sort by date (earliest → latest)
  return a.periodKey.localeCompare(b.periodKey);
});

  return (
    <Card className="w-full hover:bg-transparent">
      <CardHeader>
        <CardTitle>Casual Invoices</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="border rounded-md">
          <ScrollArea className="h-[400px]">
            <table className="w-full text-sm">
              <tbody>
  {sortedInvoices.map((invoice) => {
    const isOpen = openInvoiceId === invoice.invoiceId;
    const memberCount = invoice.members?.length ?? 0;
    const paidCount = invoice.members.filter((m) => m.isPaid).length;

    return (
      <React.Fragment key={invoice.invoiceId}>
        {/* Parent Row */}
        <tr className="border-b hover:bg-muted/40">
          <td className="px-4 py-3 w-[50px]">
            <button
              onClick={() =>
                setOpenInvoiceId(isOpen ? null : invoice.invoiceId)
              }
            >
              <ChevronRight
                className={`h-4 w-4 transition-transform ${
                  isOpen ? "rotate-90" : ""
                }`}
              />
            </button>
          </td>

          <td className="px-4 py-3 font-medium">{invoice.periodKey}</td>

          <td className="px-4 py-3">
            {memberCount} {memberCount === 1 ? "Member" : "Members"}
          </td>

          <td className="px-4 py-3">
            <Badge className={paidCount === memberCount ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
              {paidCount} / {memberCount} Paid
            </Badge>
          </td>
        </tr>

        {/* Expanded Member Rows */}
        {isOpen &&
          invoice.members.map((member) => (
            <tr
              key={member.memberInvoiceId}
              className="border-b bg-muted/20"
            >
              <td />
              <td className="px-8 py-2">{member.name}</td>
              <td />
              <td className="px-4 py-2 flex items-center gap-2">
                <Badge
                  className={
                    member.isPaid
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }
                >
                  {member.isPaid ? "Paid" : "Unpaid"}
                </Badge>

                {!member.isPaid && (
                  <Button
                    size="sm"
                    onClick={() =>
                      handleMarkPaid(
                        invoice.invoiceId,
                        member.memberInvoiceId
                      )
                    }
                  >
                    Mark as Paid
                  </Button>
                )}
              </td>
            </tr>
          ))}
      </React.Fragment>
    );
  })}
</tbody>
            </table>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}