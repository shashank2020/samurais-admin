import { useMutation } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";

const updateInvoiceNotifyStatus = async (invoiceId: number, isNotified: boolean): Promise<boolean> => {
  const supabase = createClient();
  debugger;
  const { data, error } = await supabase.rpc("updateinvoicenotifystatus", {
    invoiceid: invoiceId,
    isnotified: isNotified,
  });

  if (error) {
    console.error("Supabase RPC error:", error);
    throw new Error(error.message);
  }

  return data;
};


export function useUpdateInvoiceNotifyStatus() {
  return useMutation({
      mutationFn: ({ invoiceId, isNotified }: { invoiceId: number; isNotified: boolean }) =>
        updateInvoiceNotifyStatus(invoiceId, isNotified),
    });
}

