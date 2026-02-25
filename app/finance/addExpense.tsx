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

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/utils/supabase/client";
import { DatePickerInsideDialog } from "../invoices/DatePickerInsideDialog";

const formSchema = z.object({
  title: z.string().nonempty("Title is required"),
  amount: z.string().nonempty("Amount is required"),
  expenseDate: z.string().nonempty("Date is required"),
  category: z.string().optional(),
  notes: z.string().optional(),
});

type AddExpenseFormValues = z.infer<typeof formSchema>;

export default function AddExpense() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<AddExpenseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      amount: "",
      expenseDate: new Date().toISOString().split("T")[0],
      category: "",
      notes: "",
    },
  });

  const onSubmit = async (values: AddExpenseFormValues) => {
    const supabase = createClient();
    const { error } = await supabase.from("club_expenses").insert([
      {
        Title: values.title,
        Amount: parseFloat(values.amount),
        ExpenseDate: values.expenseDate,
        Category: values.category || null,
        Notes: values.notes || null,
      },
    ]);

    if (error) {
      toast({ variant: "destructive", title: "Error adding expense", description: error.message });
      return;
    }

    toast({ title: "Expense added", description: `${values.title} has been added.` });
    form.reset();

    // Refresh server components
    router.refresh();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">+ Add Expense</Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Club Expense</DialogTitle>
          <DialogDescription>Fill in the details below.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Expense title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="Amount" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
            control={form.control}
            name="expenseDate"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                    <DatePickerInsideDialog
                    value={field.value ? new Date(field.value) : new Date()}
                    onChange={(date) => field.onChange(date.toDateString())}
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
                )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="Category (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input placeholder="Notes (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex justify-end space-x-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Add Expense</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}