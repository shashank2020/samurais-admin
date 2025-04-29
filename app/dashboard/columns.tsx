"use client"

import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Member = {
  GivenName: string
  EmailAddress: string
  Status: "pending" | "active"
  MembershipType: string,
  MobileNumber: string,
}

export const columns: ColumnDef<Member>[] = [
  {
    accessorKey: "GivenName",
    header: "Name",
  },
  {
    accessorKey: "EmailAddress",
    header: "Email",
  },
  {
    accessorKey: "Status",
    header: "Status",
  },
  {
    accessorKey: "MembershipType",
    header: "Membership Type",
  },
  {
    accessorKey: "MobileNumber",
    header: "Contact Number",
  },
  {
    id: "Actions",
    cell: ({ row }) => {
      return (
        <Button variant="ghost">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal />
        </Button>
      )
    }
  },
]
