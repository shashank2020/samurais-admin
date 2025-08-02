"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChevronDownIcon, Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { memberSubscriptionTypes } from "../types/enums/memberSubscriptionTypes";
import { DatePickerInsideDialog } from "./DatePickerInsideDialog";
import { useCreateInvoice } from "../invoiceModulation/useCreateInvoice";
import { InvoiceDetail } from "../types/invoiceDetail";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { InvoiceMemberSelectTable } from "./invoiceMemberSelectTable";
import { Member } from "../types/member";

export default function NewInvoiceForm() {
  const formSchema = z.object({
    subscriptionType: z.nativeEnum(memberSubscriptionTypes),
    periodStart: z.date().nullable(),
    periodEnd: z.date().nullable(),
  });

  const { toast } = useToast();
  const router = useRouter();
  function addDays(startDate: Date, days: number): Date {
    const result = new Date(startDate);
    result.setDate(result.getDate() + days);
    return result;
  }
  function endOfMonth(startDate: Date): Date {
    const year = startDate.getFullYear();
    const month = startDate.getMonth();
    return new Date(year, month + 1, 0); // The 0th day of the next month is the last day of the current month
  }
  function endOfYear(startDate: Date): Date {
    const year = startDate.getFullYear();
    return new Date(year, 11, 31); // December 31st of the same year
  }
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subscriptionType: memberSubscriptionTypes.Casual,
      periodStart: null,
      periodEnd: null,
    },
  });

  const [subscriptionType, setSubscriptionType] =
    useState<memberSubscriptionTypes>(memberSubscriptionTypes.Casual);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([])
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!startDate) return;

    let calculatedEnd: Date = startDate;

    switch (subscriptionType) {
      case memberSubscriptionTypes.Casual:
        calculatedEnd = startDate;
        break;
      case memberSubscriptionTypes.Weekly:
        calculatedEnd = addDays(startDate, 6);
        break;
      case memberSubscriptionTypes.Monthly:
        calculatedEnd = endOfMonth(startDate);
        break;
      case memberSubscriptionTypes.Annual:
        calculatedEnd = endOfYear(startDate);
        break;
    }

    setEndDate(calculatedEnd);
  }, [startDate, subscriptionType]);

  const {
      mutate: createInvoice,
      isPending: isUpdating,
    } = useCreateInvoice();

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!startDate || !endDate) return alert("Please select a start and end date.");
    if (selectedMemberIds.length === 0) return alert("No members selected.");
    if (startDate > endDate) {
      return alert("Start date cannot be after end date.");
    }
    
    const invoiceData: InvoiceDetail = {
      subscriptiontype: values.subscriptionType  + 1, // Convert enum to number (1-based index)
      StartDate: startDate.toISOString(),
      DueDate: endDate.toISOString(),
      MemberIds: selectedMemberIds,
    } as InvoiceDetail;

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

    alert("Invoice Created:" + JSON.stringify(invoiceData));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Create Invoice
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-fit" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription>Details</DialogDescription>
        </DialogHeader>
          <div className="items-center space-x-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="subscriptionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Membership Type</FormLabel>
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

                <div className="flex flex-row gap-4">
                  <DatePickerInsideDialog
                    label="Start Date"
                    value={startDate}
                    onChange={(date) => setStartDate(date)}
                  />

                  <DatePickerInsideDialog
                    label="End Date"
                    value={endDate}
                    onChange={(date) => setEndDate(date)}
                  />
                </div>
                <div>
                  <InvoiceMemberSelectTable memberSubscriptionTypeSelected={subscriptionType} onSelectionChange={setSelectedMemberIds}/>
                </div>
                <div className="pt-2 flex flex-wrap gap-2">
                  <Button type="submit" className="min-w-[180px] flex-1" disabled={isUpdating || selectedMemberIds.length === 0}>
                    Create Invoice
                  </Button>
                </div>
              </form>
            </Form>
          </div>
          
        <DialogFooter>
          <DialogClose asChild></DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
