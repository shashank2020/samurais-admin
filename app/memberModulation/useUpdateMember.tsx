import { useMutation } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { Member } from "../types/member";

async function updateMember({ id, data }: { id: number; data: Partial<Member> }) {
  const supabase = createClient();
  const { data: updatedData, error } = await supabase
    .from("member_details_table")
    .update(data)
    .eq("Id", id)
    .select();

  if (error) throw new Error(error.message);
  if (!updatedData || updatedData.length === 0) throw new Error("Update failed");

  return updatedData[0];
}

export function useUpdateMember() {
  return useMutation({
      mutationFn: updateMember,
    });
}