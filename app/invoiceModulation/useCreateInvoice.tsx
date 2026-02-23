import { useMutation } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { InvoiceDetail } from "../types/invoiceDetail";

const createInvoice = async (invoiceDetail: InvoiceDetail): Promise<boolean> => {
  const supabase = createClient();
  
  const { data, error } = await supabase.rpc("GenerateMemberInvoice", {
    startdate: toPostgresDate(invoiceDetail.StartDate),
    enddate: toPostgresDate(invoiceDetail.DueDate),
    subscriptiontype: invoiceDetail.subscriptiontype,
    memberids: invoiceDetail.MemberIds,
    periodkey: invoiceDetail.PeriodKey,
  });

  if (error) {
    console.error("Supabase RPC error:", error);
    throw new Error(error.message);
  }
  return data; // assuming function returns a boolean or status
};

function toPostgresDate(date: string): string {
  return date.split("T")[0]; // "YYYY-MM-DD"
}


export function useCreateInvoice() {
  return useMutation({
    mutationFn: createInvoice,
  });
}

