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

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  transactionDate: z.string().nonempty("Date is required"),
  category: z.string().optional(),
  notes: z.string().optional(),
  type: z.enum(["expense", "income"]),
});

type TransactionFormValues = z.infer<typeof formSchema>;

export default function UpdateTransaction({
  transactionId,
}: {
  transactionId: number;
}) {
  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      amount: "",
      transactionDate: "",
      category: "",
      notes: "",
      type: "expense",
    },
  });

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!open) return;

      setLoading(true);

      const { data, error } = await supabase
        .from("club_transactions")
        .select("*")
        .eq("TransactionId", transactionId)
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "Error loading transaction",
          description: error.message,
        });
        return;
      }

      const amount = Number(data.Amount);

      form.reset({
        title: data.Title ?? "",
        amount: String(Math.abs(amount)),
        transactionDate: data.TransactionDate,
        category: data.Category ?? "",
        notes: data.Notes ?? "",
        type: amount >= 0 ? "income" : "expense",
      });

      setLoading(false);
    };

    fetchTransaction();
  }, [open]);

  const onSubmit = async (values: TransactionFormValues) => {
    const rawAmount = parseFloat(values.amount);

    const finalAmount =
      values.type === "expense"
        ? -Math.abs(rawAmount)
        : Math.abs(rawAmount);

    const { error } = await supabase
      .from("club_transactions")
      .update({
        Title: values.title,
        Amount: finalAmount,
        TransactionDate: values.transactionDate,
        Category: values.category || null,
        Notes: values.notes || null,
        Type: values.type,
      })
      .eq("TransactionId", transactionId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error updating transaction",
        description: error.message,
      });
      return;
    }

    toast({
      title: "Transaction updated",
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
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogDescription>
            Update the transaction details.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              {/* TYPE */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Tabs value={field.value} onValueChange={field.onChange}>
                        <TabsList className="grid grid-cols-2">
                          <TabsTrigger value="expense">Expense</TabsTrigger>
                          <TabsTrigger value="income">Income</TabsTrigger>
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
                      <Input type="number" step="0.01" {...field} />
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

              {/* CATEGORY */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">Update Transaction</Button>
              </DialogFooter>

            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}