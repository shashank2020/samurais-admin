import { useMutation } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";

export interface CreatePaymentGroupInput {
  name: string;
  amountPerPerson: number;
  memberIds: number[];
}

export function useCreatePaymentGroup() {
  const supabase = createClient();

  return useMutation({
    mutationFn: async (input: CreatePaymentGroupInput) => {
      // 1. Create the group first
      const { data: group, error: groupError } = await supabase
      .from("payment_groups")
      .insert({
        Title: input.name,
        AmountPerPerson: input.amountPerPerson,
        // CreatedAt: new Date().toISOString(),
      })
      .select()
      .single();

      if (groupError) throw new Error(groupError.message);
      if (!group) throw new Error("Failed to create group");

      // 2. Insert members into join table
      const groupMembersRows = input.memberIds.map((memberId) => ({
        PaymentGroupId: group.PaymentGroupId,
        MemberId: memberId,
      }));

      const { error: membersError } = await supabase
        .from("payment_group_members")
        .insert(groupMembersRows);

      if (membersError) {
        throw new Error(membersError.message);
      }

      return group;
    },
  });
}