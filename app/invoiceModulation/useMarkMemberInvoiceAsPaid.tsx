import { useMutation } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { Member } from "../types/member";
import { MemberStatus } from "../types/enums/memberStatusTypes";

const markMemberInvoiceAsPaid = async (memberInvoiceId: number): Promise<Boolean> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("member_invoice_details")
    .update({ IsPaid: true, DatePaid: new Date() })
    .eq("MemberInvoiceId", memberInvoiceId)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return true;
};

export function useMarkMemberInvoiceAsPaid() {
  return useMutation({
    mutationFn: markMemberInvoiceAsPaid,
  });
}
