// useActivateMember.ts
import { useMutation } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { Member } from "../types/member";
import { MemberStatus } from "../types/enums/memberStatusTypes";

const activateMember = async (id: number): Promise<Member> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("member_details_table")
    .update({ Status: MemberStatus.Active })
    .eq("Id", id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error("No member found.");
  }

  return data[0];
};

export function useActivateMember() {
  return useMutation({
    mutationFn: activateMember,
  });
}
