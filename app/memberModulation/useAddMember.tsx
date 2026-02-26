import { useMutation } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { Member } from "../types/member";

async function addMember(data: Partial<Member>) {
  console.log("Adding member with data:", data);
  const supabase = createClient();

  const { error } = await supabase
    .from("member_details_table")
    .insert(data)

  if (error) throw new Error("error adding member: " + error.message);

}

export function useAddMember() {
  return useMutation({
    mutationFn: addMember,
  });
}