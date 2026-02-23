"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Check, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useMarkMemberInvoiceAsPaid } from "../invoiceModulation/useMarkMemberInvoiceAsPaid"
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type MembershipType = "monthly" | "semiannual" | "annual"
type Status = "paid" | "unpaid" | "none"

export type GridMember = {
  id: number
  name: string
  subscriptionType: string
  payments: Record<
    string,
    { status: Status; memberInvoiceId: number | null }
  > // keyed by PeriodKey (e.g. 2026-01, 2026-H1, 2026)
}

interface Props {
  members: GridMember[]
}

export function MembershipPaymentGrid({ members }: Props) {
  const [type, setType] = React.useState<MembershipType>("monthly")
  const [selectedYear, setSelectedYear] = React.useState(
    new Date().getFullYear().toString()
  )
  const { toast } = useToast()
  const { mutate: markMemberPaid } =
    useMarkMemberInvoiceAsPaid()
  const router = useRouter();
  // Local copy to immediately update grid cells
  const [localMembers, setLocalMembers] = React.useState<GridMember[]>(members)
  const [filteredMembers, setFilteredMembers] = React.useState<GridMember[]>([])
  // Year options: current -1, current, current +1
  const currentYear = new Date().getFullYear()
  const yearOptions = [
    (currentYear - 1).toString(),
    currentYear.toString(),
    (currentYear + 1).toString(),
  ]

  // Columns for display
  const columns = React.useMemo(() => {
    if (type === "monthly") {
      return [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ]
    }
    if (type === "semiannual") return ["Jan–Jun", "Jul–Dec"]
    return ["Full Year"]
  }, [type])

  // Map periodKey → column name
  const mapPeriodKeyToColumn = (periodKey: string): string | null => {
    if (!periodKey.startsWith(selectedYear)) return null
    if (type === "monthly") {
      const month = periodKey.split("-")[1]
      const monthMap: Record<string, string> = {
        "01": "Jan",
        "02": "Feb",
        "03": "Mar",
        "04": "Apr",
        "05": "May",
        "06": "Jun",
        "07": "Jul",
        "08": "Aug",
        "09": "Sep",
        "10": "Oct",
        "11": "Nov",
        "12": "Dec",
      }
      return monthMap[month] ?? null
    }
    if (type === "semiannual") {
      if (periodKey.includes("H1")) return "Jan–Jun"
      if (periodKey.includes("H2")) return "Jul–Dec"
    }
    if (type === "annual") return "Full Year"
    return null
  }


  // Filter members by subscription type
  useEffect(() => {
  setFilteredMembers(
    localMembers.filter((m) => m.subscriptionType?.toLowerCase() === type)
  )
}, [localMembers, type])

  const handleMarkPaid = (
    memberInvoiceId: number,
    memberId: number,
    periodKey: string
  ) => {
    markMemberPaid(memberInvoiceId, {
      onSuccess: () => {
        toast({
          title: "Invoice marked as paid",
          description: `Member invoice updated successfully.`,
        })

        // Update local grid immediately
        setLocalMembers((prev) =>
          prev.map((m) => {
            if (m.id !== memberId) return m
            return {
              ...m,
              payments: {
                ...m.payments,
                [periodKey]: { status: "paid", memberInvoiceId },
              },
            }
          })
        )
        router.refresh();
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error?.message || "Something went wrong",
        })
      },
    })
  }

  return (
    <Card className="w-full hover:bg-transparent">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Member payments</CardTitle>
        <div className="flex items-center gap-4">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Tabs value={type} onValueChange={(v) => setType(v as MembershipType)}>
            <TabsList>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="semiannual">Semi-Annual</TabsTrigger>
              <TabsTrigger value="annual">Annual</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent>
        <div className="border rounded-md">
          {/* HEADER */}
          <table className="w-full border-collapse text-sm table-fixed">
            <thead>
              <tr className="border-b">
                <th className="sticky left-0 z-20 bg-background text-left px-4 py-3 font-medium w-[240px] min-w-[240px]">
                  Member
                </th>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-center font-medium whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
          </table>

          {/* BODY */}
          <ScrollArea className="h-[420px]">
            <table className="w-full border-collapse text-sm table-fixed">
              <tbody>
  {filteredMembers.map((member) => (
    <tr key={member.id} className="border-b">
      <td className="sticky left-0 z-10 bg-background px-4 py-3 font-medium w-[240px] min-w-[240px]">
        {member.name}
      </td>

      {columns.map((col) => {
        // Find the periodKey that maps to this column
        const periodKey = Object.keys(member.payments).find(
          (pk) => mapPeriodKeyToColumn(pk) === col
        )

        // Determine status and memberInvoiceId
        let paymentStatus: Status = "none"
        let memberInvoiceId: number | null = null

        if (periodKey) {
          paymentStatus = member.payments[periodKey].status
          memberInvoiceId = member.payments[periodKey].memberInvoiceId
        }

        return (
          <td key={col} className="px-4 py-3 text-center">
            <Popover>
              <PopoverTrigger asChild>
                <div
                  className={cn(
                    "h-6 w-6 rounded-md flex items-center justify-center mx-auto cursor-pointer transition-transform hover:scale-110",
                    paymentStatus === "paid"
                      ? "bg-green-500"
                      : paymentStatus === "unpaid"
                      ? "bg-red-500"
                      : "bg-muted"
                  )}
                >
                  {paymentStatus === "paid" ? (
                    <Check className="h-3 w-3 text-white" />
                  ) : paymentStatus === "unpaid" ? (
                    <X className="h-3 w-3 text-white" />
                  ) : null}
                </div>
              </PopoverTrigger>

              {paymentStatus !== "paid" && memberInvoiceId && (
                <PopoverContent className="w-36 p-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      handleMarkPaid(memberInvoiceId, member.id, periodKey!)
                    }
                  >
                    Mark as Paid
                  </Button>
                </PopoverContent>
              )}
            </Popover>
          </td>
        )
      })}
    </tr>
  ))}
</tbody>
            </table>
          </ScrollArea>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-6 text-xs text-muted-foreground">
          <Legend color="bg-green-500" label="Paid" />
          <Legend color="bg-red-500" label="Unpaid" />
          <Legend color="bg-muted" label="No Invoice" />
        </div>
      </CardContent>
    </Card>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn("h-3 w-3 rounded-sm", color)} />
      <span>{label}</span>
    </div>
  )
}