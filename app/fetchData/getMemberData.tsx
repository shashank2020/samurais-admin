import { createClient } from "@/utils/supabase/client";
import { PostgrestResponse } from "@supabase/supabase-js";
import { Member } from "../types/member";

export const getMemberDetailsById = async (id: number): Promise<Member | null> => {
    const supabase = await createClient(); 
    const { data, error }: PostgrestResponse<Member> = await supabase
    .from("member_details_table")
    .select()
    .eq("Id", id)
    
    if (error) {
        console.error("Error fetching member:", error.message);
        return null;
      }
    return data && data.length > 0 ? data[0] : null;;
};