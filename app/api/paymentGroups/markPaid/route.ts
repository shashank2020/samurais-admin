import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const { paymentGroupMemberId } = await req.json();
  const supabase = await createClient();

  // Get the row
  const { data: memberRow } = await supabase
    .from("payment_group_members")
    .select("Id, MemberId, PaymentGroupId, IsPaid")
    .eq("Id", paymentGroupMemberId)
    .single();

  if (!memberRow) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (memberRow.IsPaid) {
    return NextResponse.json({ error: "Already paid" }, { status: 400 });
  }

  // Get group info
  const { data: group } = await supabase
    .from("payment_groups")
    .select("Title, AmountPerPerson")
    .eq("PaymentGroupId", memberRow.PaymentGroupId)
    .single();

  // Get member name
  const { data: memberDetails } = await supabase
    .from("member_details_table")
    .select("GivenName")
    .eq("Id", memberRow.MemberId)
    .single();

  const today = new Date().toISOString().split("T")[0];

  // 1️⃣ Mark as paid
  await supabase
    .from("payment_group_members")
    .update({
      IsPaid: true,
      DatePaid: today,
    })
    .eq("Id", paymentGroupMemberId);

  // 2️⃣ Insert into club_transactions
  await supabase.from("club_transactions").insert({
    Title: `${group?.Title} (${memberDetails?.GivenName})`,
    Amount: group?.AmountPerPerson ?? 0,
    TransactionDate: today,
    Type: "income",
    Source: "payment_group",
    Category: "Payment Group",
  });

  return NextResponse.json({ success: true });
}