import { useMutation } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";

const markMemberInvoiceAsUnpaid = async (
  memberInvoiceId: number
): Promise<boolean> => {
  const supabase = createClient();

  const { error } = await supabase
    .from("member_invoice_details")
    .update({
      IsPaid: false,
      DatePaid: null,
    })
    .eq("MemberInvoiceId", memberInvoiceId);

  if (error) {
    throw new Error(error.message);
  }

  return true;
};

export function useMarkMemberInvoiceAsUnpaid() {
  return useMutation({
    mutationFn: markMemberInvoiceAsUnpaid,
  });
}