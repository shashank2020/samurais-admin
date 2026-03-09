"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { Input } from "@/components/ui/input";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function IncomeRowActions({
  memberInvoiceId,
  date,
  description,
  amount,
}: {
  memberInvoiceId: number;
  date: string;
  description: string;
  amount: number;
}) {
  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();

  const [newAmount, setNewAmount] = useState(amount);

  const updateAmount = async () => {
    const { error } = await supabase
      .from("member_invoice_details")
      .update({
        Amount: Number(newAmount),
      })
      .eq("MemberInvoiceId", memberInvoiceId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message,
      });
      return;
    }

    toast({
      title: "Amount updated",
    });

    router.refresh();
  };

  const markUnpaid = async () => {
    const { error } = await supabase
      .from("member_invoice_details")
      .update({
        IsPaid: false,
      })
      .eq("MemberInvoiceId", memberInvoiceId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message,
      });
      return;
    }

    toast({
      title: "Payment removed",
    });

    router.refresh();
  };

  return (
    <div className="flex gap-2 justify-end">

      {/* EDIT AMOUNT */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Payment Amount</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">

            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="text-sm">{new Date(date).toLocaleDateString()}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="text-sm">{description}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Amount</p>
              <Input
                type="number"
                step="0.01"
                value={newAmount}
                onChange={(e) => setNewAmount(Number(e.target.value))}
              />
            </div>

          </div>

          <DialogFooter>
            <Button onClick={updateAmount}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE / MARK UNPAID */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Payment</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the invoice as unpaid.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={markUnpaid}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}