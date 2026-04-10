"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/utils/supabase/client";
import { DatePickerInsideDialog } from "../invoices/DatePickerInsideDialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  title: z.string().nonempty("Title is required"),
  amount: z.string().nonempty("Amount is required"),
  transactionDate: z.string().nonempty("Date is required"),
  category: z.string().optional(),
  notes: z.string().optional(),
  type: z.enum(["expense", "income"]),
});

type AddTransactionFormValues = z.infer<typeof formSchema>;

export default function AddTransaction() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<AddTransactionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      amount: "",
      transactionDate: new Date().toISOString().split("T")[0],
      category: "",
      notes: "",
      type: "expense",
    },
  });

  const onSubmit = async (values: AddTransactionFormValues) => {
    const supabase = createClient();

    const rawAmount = parseFloat(values.amount);

    const finalAmount =
      values.type === "expense"
        ? -Math.abs(rawAmount)
        : Math.abs(rawAmount);

    const { error } = await supabase.from("club_transactions").insert([
      {
        Title: values.title,
        Amount: finalAmount,
        TransactionDate: values.transactionDate,
        Category: values.category || null,
        Notes: values.notes || null,
        Type: values.type,
      },
    ]);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error adding transaction",
        description: error.message,
      });
      return;
    }

    toast({
      title: "Transaction added",
      description: `${values.title} has been added.`,
    });

    form.reset();
    router.refresh();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">+ Add Transaction</Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>
            Record an expense or income.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            {/* TYPE TOGGLE */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Tabs
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <TabsList className="grid grid-cols-2">
                        <TabsTrigger value="expense">
                          Expense
                        </TabsTrigger>
                        <TabsTrigger value="income">
                          Income
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* TITLE */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Transaction title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* AMOUNT */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Amount"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* DATE */}
            <FormField
              control={form.control}
              name="transactionDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <DatePickerInsideDialog
                      value={
                        field.value
                          ? new Date(field.value)
                          : new Date()
                      }
                      onChange={(date) =>
                        field.onChange(date.toDateString())
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* CATEGORY */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Category (optional)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* NOTES */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Notes (optional)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex justify-end space-x-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Add Transaction</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}