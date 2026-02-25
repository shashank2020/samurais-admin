"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

import { memberSubscriptionTypes } from "../types/enums/memberSubscriptionTypes";
import { DatePickerInsideDialog } from "./DatePickerInsideDialog";
import { useCreateInvoice } from "../invoiceModulation/useCreateInvoice";
import { InvoiceDetail } from "../types/invoiceDetail";
import { useToast } from "@/hooks/use-toast";
import { InvoiceMemberSelectTable } from "./invoiceMemberSelectTable";
import { createClient } from '@/utils/supabase/client';


export default function NewInvoiceForm() {

  const supabase = createClient();
  // ----------------- Form Schema -----------------
  const formSchema = z.object({
    subscriptionType: z.nativeEnum(memberSubscriptionTypes),
    periodStart: z.date().nullable(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subscriptionType: memberSubscriptionTypes.Casual,
      periodStart: null,
    },
  });

  const { toast } = useToast();
  const router = useRouter();
  const { mutate: createInvoice, isPending: isUpdating } = useCreateInvoice();

  // ----------------- State -----------------
  const [subscriptionType, setSubscriptionType] = useState<memberSubscriptionTypes>(
    memberSubscriptionTypes.Casual
  );
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedPeriodKey, setSelectedPeriodKey] = useState<string>("");
  const [existingPeriodKeys, setExistingPeriodKeys] = useState<string[]>([]);

  // ----------------- Helper Functions -----------------

  const addMonths = (start: Date, months: number): Date => {
  const year = start.getFullYear();
  const month = start.getMonth() + (months - 1); // subtract 1 to include current month
  const day = start.getDate();

  const newYear = year + Math.floor(month / 12);
  const newMonth = month % 12;

  // Ensure day is valid for new month
  const lastDayOfNewMonth = new Date(newYear, newMonth + 1, 0).getDate();
  const newDay = Math.min(day, lastDayOfNewMonth);

  return new Date(newYear, newMonth, newDay);
};

  const endOfMonth = (start: Date) => new Date(start.getFullYear(), start.getMonth() + 1, 0);
  const endOfYear = (start: Date) => new Date(start.getFullYear(), 11, 31);

  const calculateEndDate = (start: Date) => {
    switch (subscriptionType) {
      case memberSubscriptionTypes.Casual:
        return start;
      case memberSubscriptionTypes.Monthly:
        return endOfMonth(start);
      case memberSubscriptionTypes.Annual:
        return endOfYear(start);
      case memberSubscriptionTypes.SemiAnnual:
        return addMonths(start, 6);
      default:
        return start;
    }
  };
  // ----------------- Effect: Update termLabel -----------------
useEffect(() => {
  const fetchExistingPeriods = async () => {
    if (subscriptionType === memberSubscriptionTypes.Casual) {
      setExistingPeriodKeys([]);
      return;
    }

    const { data, error } = await supabase
      .from("invoices")
      .select("PeriodKey")
      .eq("MemberSubscriptionType", memberSubscriptionTypes[subscriptionType]);

    if (error) {
      console.error("Error fetching period keys:", error);
      return;
    }

    if (data) {
      setExistingPeriodKeys(
        data
          .map((d: any) => d.PeriodKey)
          .filter((k: string | null): k is string => !!k)
      );
    }
  };

  fetchExistingPeriods();
}, [open, subscriptionType]);



  useEffect(() => {
    if (!startDate) return;

    const endDate = calculateEndDate(startDate);
  }, [startDate, subscriptionType]);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  // ----------------- Submit -----------------
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!startDate) return alert("Please select a start date.");
    if (selectedMemberIds.length === 0) return alert("No members selected.");

    const endDate = calculateEndDate(startDate);

    const periodKey =
  subscriptionType ===
  memberSubscriptionTypes.Casual
    ? formatDate(startDate)
    : selectedPeriodKey;
    const invoiceData: InvoiceDetail = {
      subscriptiontype: values.subscriptionType + 1,
      StartDate: subscriptionType ===
  memberSubscriptionTypes.Casual ? startDate.toDateString() : new Date().toDateString(), // for casual use the session date, for others use current date as placeholder
      DueDate: endDate.toISOString(),
      MemberIds: selectedMemberIds,
      InvoiceId: 0,
      MemberSubscriptionType: "",
      PublicUrl: "",
      PeriodKey: periodKey, // 👈 new field
    };

    createInvoice(invoiceData, {
      onSuccess: () => {
        toast({ title: "Invoice Created", description: `Invoice created successfully!` });
        setOpen(false);
        router.refresh();
      },
      onError: (error: any) => {
        toast({ variant: "destructive", title: "Invoice creation failed", description: error.stack || error.message });
      },
    });
  };

  // ----------------- Render -----------------
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Create invoice
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-fit" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Create invoice</DialogTitle>
          <DialogDescription>Fill in invoice details</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Membership Type */}
            <FormField
              control={form.control}
              name="subscriptionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Membership type</FormLabel>
                  <FormControl>
                    <Select
                      value={memberSubscriptionTypes[field.value]}
                      onValueChange={(val) => {
                        const numericValue = memberSubscriptionTypes[val as keyof typeof memberSubscriptionTypes];
                        field.onChange(numericValue);
                        setSubscriptionType(numericValue);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Membership Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(memberSubscriptionTypes)
                          .filter((key) => isNaN(Number(key)))
                          .map((key) => (
                            <SelectItem key={key} value={key}>
                              {key}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Start Date */}
            {subscriptionType === memberSubscriptionTypes.Casual ? (
            <DatePickerInsideDialog
              label="Session date"
              value={startDate}
              onChange={setStartDate}
              mode="date"
            />
) : (
  <>
    {/* Year Select */}
    <div className="space-y-2">
      <label className="text-sm font-medium">Year</label>
      <Select
        value={selectedYear.toString()}
        onValueChange={(val) =>
          setSelectedYear(Number(val))
        }
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 5 }, (_, i) => {
            const year = new Date().getFullYear() - 2 + i;
            return (
              <SelectItem
                key={year}
                value={year.toString()}
              >
                {year}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>

    {/* Period Select */}
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Available Periods
      </label>

      <Select
        value={selectedPeriodKey}
        onValueChange={(val) =>
          setSelectedPeriodKey(val)
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          {subscriptionType ===
            memberSubscriptionTypes.Monthly &&
            Array.from({ length: 12 }, (_, i) => {
              const key = `${selectedYear}-${String(
                i + 1
              ).padStart(2, "0")}`;

              return (
                <SelectItem
                  key={key}
                  value={key}
                >
                  {new Date(
                    selectedYear,
                    i
                  ).toLocaleString("en-NZ", {
                    month: "long",
                  })}{" "}
                  {selectedYear}
                  {existingPeriodKeys.includes(key)
                    ? " ✓ Generated"
                    : ""}
                </SelectItem>
              );
            })}

          {subscriptionType ===
            memberSubscriptionTypes.SemiAnnual &&
            ["H1", "H2"].map((half) => {
              const key = `${selectedYear}-${half}`;

              return (
                <SelectItem
                  key={key}
                  value={key}
                >
                  {half === "H1"
                    ? `Jan – Jun ${selectedYear}`
                    : `Jul – Dec ${selectedYear}`}
                  {existingPeriodKeys.includes(key)
                    ? " ✓ Generated"
                    : ""}
                </SelectItem>
              );
            })}

          {subscriptionType ===
            memberSubscriptionTypes.Annual && (
            <SelectItem
              value={`${selectedYear}`}
            >
              {selectedYear}
              {existingPeriodKeys.includes(
                `${selectedYear}`
              )
                ? " ✓ Generated"
                : ""}
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  </>
)}

            {/* Members */}
            <InvoiceMemberSelectTable
              memberSubscriptionTypeSelected={subscriptionType}
              onSelectionChange={setSelectedMemberIds}
            />

            {/* Submit */}
            <div className="pt-2 flex flex-wrap gap-2">
              <Button
                type="submit"
                className="min-w-[180px] flex-1"
                disabled={isUpdating || selectedMemberIds.length === 0}
              >
                Create invoice
              </Button>
            </div>
          </form>
        </Form>

        <DialogFooter>
          <DialogClose asChild />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
