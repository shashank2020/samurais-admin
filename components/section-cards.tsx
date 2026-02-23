import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { UsersRound, UserRoundPen, Receipt, TriangleAlert } from 'lucide-react';

export function SectionCards({activeMembers = 0, pendingMembers = 0, invoicesDue = 0, paymentsDue = 0}) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card flex flex-wrap gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6">
      <Card className="@container/card flex-1 min-w-[250px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 ">
            <UsersRound/>
            Active members
          </CardTitle>
          <label className="text-2xl tabular-nums @[250px]/card:text-3xl">
            {activeMembers}
          </label>
        </CardHeader>
      </Card>
      <Card className="@container/card flex-1 min-w-[250px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRoundPen/>
            Pending members
          </CardTitle>
          <label className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {pendingMembers}
          </label>
        </CardHeader>
      </Card>
      <Card className="@container/card flex-1 min-w-[250px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt />
            Invoices due
          </CardTitle>
          <label className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {invoicesDue}
          </label>
        </CardHeader>
      </Card>
      <Card className="@container/card flex-1 min-w-[250px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TriangleAlert />
            Member payments due
          </CardTitle>
          <label className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {paymentsDue}
          </label>
        </CardHeader>
      </Card>
    </div>
  )
}
