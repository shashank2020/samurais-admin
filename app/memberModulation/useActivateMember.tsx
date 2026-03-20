// useActivateMember.ts
import { useMutation } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { Member } from "../types/member";
import { MemberStatus } from "../types/enums/memberStatusTypes";

type ActivateMemberPayload = {
  id: number;
  data: Partial<Member>;
  includeInInvoice?: boolean;
  invoiceId?: number;
};

const activateMember = async ({
  id,
  data,
  includeInInvoice,
  invoiceId,
}: ActivateMemberPayload): Promise<Member> => {
  const supabase = createClient();

  // 🔥 1. Update member + set active
  const { data: updatedMember, error: updateError } = await supabase
    .from("member_details_table")
    .update({
      ...data,
      Status: MemberStatus.Active,
    })
    .eq("Id", id)
    .select()
    .single();

  if (updateError) {
    throw new Error(updateError.message);
  }

  // 🔥 2. Optionally insert invoice record
  if (includeInInvoice && invoiceId) {
    // 1. Get membership type (prefer payload, fallback to DB)
    const membershipType =
      data.MembershipType ||
      updatedMember.MembershipType;

    // 2. Fetch rate
    const { data: rateData, error: rateError } = await supabase
      .from("member_subscription_types")
      .select("rate")
      .eq("MembershipType", membershipType)
      .single();

    if (rateError) {
      throw new Error(rateError.message);
    }

    const amount = rateData.rate ?? 0;

    // 3. Insert invoice detail
    const { error: invoiceError } = await supabase
      .from("member_invoice_details")
      .insert({
        MemberId: id,
        InvoiceId: invoiceId,
        Amount: amount,
        IsPaid: false,
      });

    if (invoiceError) {
      throw new Error(invoiceError.message);
    }
  }

  return updatedMember;
};

export function useActivateMember() {
  return useMutation({
    mutationFn: activateMember,
  });
}