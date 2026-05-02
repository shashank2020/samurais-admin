"use client"

import * as React from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useMarkPaymentGroupMemberAsPaid } from "../hooks/useMarkPaymentGroupMemberAsPaid"
import NewPaymentGroupForm from "./newPaymentGroupForm"

type PaymentGroupMember = {
  paymentGroupMemberId: number
  memberId: number
  name: string
  isPaid: boolean
}

type PaymentGroup = {
  paymentGroupId: number
  title: string
  amountPerPerson: number
  members: PaymentGroupMember[]
}

export function PaymentGroupGrid({ groups }: { groups: PaymentGroup[] }) {
  const { toast } = useToast()
  const { mutate } = useMarkPaymentGroupMemberAsPaid()

  const [openGroupId, setOpenGroupId] = useState<number | null>(null)
  const [localGroups, setLocalGroups] = useState(groups)

    useEffect(() => {
    setLocalGroups(groups)
    }, [groups])

  const handleMarkPaid = (
    paymentGroupId: number,
    paymentGroupMemberId: number
  ) => {
    mutate(paymentGroupMemberId, {
      onSuccess: () => {
        toast({ title: "Marked as paid" })

        setLocalGroups(prev =>
          prev.map(group => {
            if (group.paymentGroupId !== paymentGroupId) return group

            return {
              ...group,
              members: group.members.map(member =>
                member.paymentGroupMemberId === paymentGroupMemberId
                  ? { ...member, isPaid: true }
                  : member
              ),
            }
          })
        )
      },
    })
  }

  return (
    <Card className="w-full hover:bg-transparent">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Payment Groups</CardTitle>

        <div className="flex items-center">
            <NewPaymentGroupForm />
        </div>
      </CardHeader>

      <CardContent>
        <div className="border rounded-md">
          <ScrollArea className="h-[400px]">
            <table className="w-full text-sm">
              <tbody>
                {localGroups.map(group => {
                  const isOpen = openGroupId === group.paymentGroupId
                  const totalMembers = group.members.length
                  const paidCount = group.members.filter(m => m.isPaid).length
                  const totalValue = totalMembers * group.amountPerPerson

                  return (
                    <React.Fragment key={group.paymentGroupId}>
                      {/* Parent Row */}
                      <tr className="border-b hover:bg-muted/40">
                        <td className="px-4 py-3 w-[50px]">
                          <button
                            onClick={() =>
                              setOpenGroupId(
                                isOpen ? null : group.paymentGroupId
                              )
                            }
                          >
                            <ChevronRight
                              className={`h-4 w-4 transition-transform ${
                                isOpen ? "rotate-90" : ""
                              }`}
                            />
                          </button>
                        </td>

                        <td className="px-4 py-3 font-medium">
                          {group.title}
                          <div className="text-xs text-muted-foreground">
                            ${group.amountPerPerson} per person
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          {totalMembers}{" "}
                          {totalMembers === 1 ? "Member" : "Members"}
                        </td>

                        <td className="px-4 py-3">
                          <Badge
                            className={
                              paidCount === totalMembers
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }
                          >
                            {paidCount} / {totalMembers} Paid
                          </Badge>
                        </td>

                        <td className="px-4 py-3 text-right">
                          ${totalValue.toFixed(2)}
                        </td>
                      </tr>

                      {/* Expanded Rows */}
                      {isOpen &&
                        group.members.map(member => (
                          <tr
                            key={member.paymentGroupMemberId}
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
                                      group.paymentGroupId,
                                      member.paymentGroupMemberId
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
                  )
                })}
              </tbody>
            </table>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}