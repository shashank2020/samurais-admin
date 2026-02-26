"use client"
import { Column, ColumnDef } from "@tanstack/react-table"
import { Member } from "../types/member"
import { MemberStatus } from "../types/enums/memberStatusTypes"
import MemberForm from "./memberForm";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

interface SortButtonProps {
  title: string;
  column: Column<Member, unknown>; 
}

export function SortButton({ title, column }: SortButtonProps) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}

const statusClasses: Record<number, string> = {
  [MemberStatus.Pending.valueOf()]: "bg-orange-100 text-orange-800",
  [MemberStatus.Active.valueOf()]: "bg-green-100 text-green-800",
  [MemberStatus.Inactive.valueOf()]: "bg-red-100 text-red-800",
  [MemberStatus.undefined.valueOf()]: "bg-red-100 text-red-800"
};

export const columns: ColumnDef<Member>[] = [
  {
    accessorKey: "Id",
    header: ({ column }) => {
      return (
        <SortButton title={"Id"} column={column}/>
      )
    },
  },
  {
    accessorKey: "GivenName",
    header: ({ column }) => {
      return (
        <SortButton title={"Name"} column={column}/>
      )
    },
  },
  {
    accessorKey: "EmailAddress",
    header: "Email",
  },
  {
    accessorKey: "MobileNumber",
    header: "Contact Number",
  },
  {
    accessorKey: "MembershipType",
    header: "Membership Type",
  },
  {
    accessorKey: "Status",
    header: "Status",
    cell: ({row}) => {
      const statusId = parseInt(row.getValue("Status"))
      return (
        <span
      className={`px-2 py-1 rounded-full text-sm font-medium ${statusClasses[statusId]}`}
    >
      {MemberStatus[statusId]}
    </span>)
    }
  },
  {
    id: "ViewDetails",
    cell: ({ row }) => {
      return (
        <MemberForm mode="edit" row={row.original}/>
      )
    }
  },
]
