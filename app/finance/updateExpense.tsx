"use client";

import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { DatePickerInsideDialog } from "../invoices/DatePickerInsideDialog";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  title: z.string().nonempty("Title is required"),
  amount: z.string().nonempty("Amount is required"),
  expenseDate: z.string().nonempty("Date is required"),
  category: z.string().optional(),
  notes: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof formSchema>;

export default function UpdateExpense({
  expenseId,
}: {
  expenseId: number;
}) {
  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      amount: "",
      expenseDate: "",
      category: "",
      notes: "",
    },
  });

  // Fetch expense when dialog opens
  useEffect(() => {
    const fetchExpense = async () => {
      if (!open) return;

      setLoading(true);

      const { data, error } = await supabase
        .from("club_expenses")
        .select("*")
        .eq("ExpenseId", expenseId)
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "Error loading expense",
          description: error.message,
        });
        return;
      }

      form.reset({
        title: data.Title ?? "",
        amount: String(data.Amount ?? ""),
        expenseDate: data.ExpenseDate,
        category: data.Category ?? "",
        notes: data.Notes ?? "",
      });

      setLoading(false);
    };

    fetchExpense();
  }, [open]);

  const onSubmit = async (values: ExpenseFormValues) => {
    const { error } = await supabase
      .from("club_expenses")
      .update({
        Title: values.title,
        Amount: parseFloat(values.amount),
        ExpenseDate: values.expenseDate,
        Category: values.category || null,
        Notes: values.notes || null,
      })
      .eq("ExpenseId", expenseId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error updating expense",
        description: error.message,
      });
      return;
    }

    toast({
      title: "Expense updated",
    });

    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Club Expense</DialogTitle>
          <DialogDescription>Update the expense details.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
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
                        onChange={(date) =>
                          field.onChange(date.toISOString().split("T")[0])
                        }
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

              <DialogFooter>
                <Button type="submit">Update Expense</Button>
              </DialogFooter>

            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}