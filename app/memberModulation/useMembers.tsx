import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { Member } from "../types/member"; // adjust if needed
import { memberSubscriptionTypes } from "../types/enums/memberSubscriptionTypes";

const fetchMembers = async (memberStatus: number): Promise<Member[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("member_details_table")
    .select("*")
    .eq("Status", memberStatus)
    .order("GivenName", { ascending: true })

  if (error) throw new Error(error.message);
  return data ?? [];
};

export function useMembers(memberStatus: number) {
  return useQuery({
    queryKey: ["members", memberStatus],
    queryFn: () => fetchMembers(memberStatus),
  });
}