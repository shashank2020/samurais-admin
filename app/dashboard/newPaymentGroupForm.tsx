"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { InvoiceMemberSelectTable } from "../invoices/invoiceMemberSelectTable";
import { useCreatePaymentGroup } from "../hooks/useCreatePaymentGroup";

const formSchema = z.object({
  groupName: z.string().min(1, "Group name is required"),
  amountPerPerson: z.coerce.number().min(0.01, "Amount must be greater than 0"),
});

export default function NewPaymentGroupForm() {
  const router = useRouter();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);

  const { mutate: createPaymentGroup, isPending } = useCreatePaymentGroup();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      groupName: "",
      amountPerPerson: 0,

    },
  });

  // ---------------- Submit ----------------
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (selectedMemberIds.length === 0) {
      toast({
        variant: "destructive",
        title: "No members selected",
      });
      return;
    }

    createPaymentGroup(
  {
    name: values.groupName,
    amountPerPerson: values.amountPerPerson,
    memberIds: selectedMemberIds,
  },
  {
    onSuccess: () => {
      toast({ title: "Payment Group Created" });
      setOpen(false);
      form.reset();
      router.refresh();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed",
        description: error.message,
      });
    },
  }
);
  };

  // ---------------- UI ----------------
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2" />
          Create
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-fit">
        <DialogHeader>
          <DialogTitle>Create payment group</DialogTitle>
          <DialogDescription>
            Group members together for shared payments
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* Group Name */}
            <FormField
              control={form.control}
              name="groupName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Team Fees 2026" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Amount Per Person */}
            <FormField
            control={form.control}
            name="amountPerPerson"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Amount per person</FormLabel>
                <FormControl>
                    <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 20.00"
                    {...field}
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            {/* Members */}
            <InvoiceMemberSelectTable
              memberSubscriptionTypeSelected={null}
              onSelectionChange={setSelectedMemberIds}
            />

            {/* Submit */}
            <Button
              type="submit"
              disabled={isPending || selectedMemberIds.length === 0}
              className="w-full"
            >
              Create group
            </Button>

          </form>
        </Form>

        <DialogFooter>
          <DialogClose asChild />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}