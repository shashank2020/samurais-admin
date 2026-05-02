import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { createClient } from "@/utils/supabase/server";

import { MembershipPaymentGrid } from "./membershipPaymentGrid";
import { CasualMembershipPaymentGrid } from "./casualMembershipPaymentGrid";
import { PaymentGroupGrid } from "./paymentGroupGrid";

export default async function Page() {
  const supabase = await createClient();

  // -----------------------------
  // FETCH BASE DATA
  // -----------------------------

  const { data: invoices } = await supabase
    .from("invoices")
    .select("InvoiceId, PeriodKey, MemberSubscriptionType, StartDate")
    .order("StartDate", { ascending: true });

  const { data: members } = await supabase
    .from("member_details_table")
    .select("Id, GivenName, MembershipType")
    .eq("Status", 1)
    .order("Id", { ascending: true });

  const { data: memberInvoiceData } = await supabase
    .from("member_invoice_details")
    .select("MemberInvoiceId, MemberId, InvoiceId, IsPaid");

  // 🔥 NEW: Payment Groups
  const { data: paymentGroups } = await supabase
    .from("payment_groups")
    .select("PaymentGroupId, Title, AmountPerPerson")
    .order("CreatedAt", { ascending: false });

  const { data: paymentGroupMembers } = await supabase
    .from("payment_group_members")
    .select("Id, PaymentGroupId, MemberId, IsPaid");

  if (
    !invoices ||
    !members ||
    !memberInvoiceData ||
    !paymentGroups ||
    !paymentGroupMembers
  ) {
    return <div>Error loading data</div>;
  }

  // -----------------------------
  // MEMBERSHIP GRID
  // -----------------------------

  const membershipInvoices = invoices.filter(
    (i) => i.MemberSubscriptionType !== "Casual"
  );

  const gridMembers = members.map((member) => {
    const memberPayments: Record<
      string,
      { status: "none" | "paid" | "unpaid"; memberInvoiceId: number | null }
    > = {};

    membershipInvoices.forEach((inv) => {
      if (!inv.PeriodKey) return;
      memberPayments[inv.PeriodKey] = {
        status: "none",
        memberInvoiceId: null,
      };
    });

    const memberDetails = memberInvoiceData.filter(
      (x) => x.MemberId === member.Id
    );

    memberDetails.forEach((detail) => {
      const invoice = membershipInvoices.find(
        (i) => i.InvoiceId === detail.InvoiceId
      );
      if (!invoice?.PeriodKey) return;

      memberPayments[invoice.PeriodKey] = {
        status: detail.IsPaid ? "paid" : "unpaid",
        memberInvoiceId: detail.MemberInvoiceId,
      };
    });

    return {
      id: member.Id,
      name: member.GivenName,
      subscriptionType: member.MembershipType,
      payments: memberPayments,
    };
  });

  // -----------------------------
  // CASUAL INVOICES
  // -----------------------------

  const casualInvoicesRaw = invoices.filter(
    (i) => i.MemberSubscriptionType === "Casual"
  );

  const casualInvoiceGroups = casualInvoicesRaw.map((invoice) => {
    const relatedDetails = memberInvoiceData.filter(
      (d) => d.InvoiceId === invoice.InvoiceId
    );

    const membersForInvoice = relatedDetails.map((detail) => {
      const member = members.find((m) => m.Id === detail.MemberId);

      return {
        memberInvoiceId: detail.MemberInvoiceId,
        memberId: detail.MemberId,
        name: member?.GivenName ?? "Unknown",
        isPaid: detail.IsPaid,
      };
    });

    return {
      invoiceId: invoice.InvoiceId,
      periodKey: invoice.PeriodKey,
      members: membersForInvoice,
    };
  });

  // -----------------------------
  // 🔥 PAYMENT GROUPS (NEW)
  // -----------------------------

  const paymentGroupData = paymentGroups.map((group) => {
    const groupMembers = paymentGroupMembers
      .filter((m) => m.PaymentGroupId === group.PaymentGroupId)
      .map((m) => {
        const member = members.find((mem) => mem.Id === m.MemberId);

        return {
          paymentGroupMemberId: m.Id,
          memberId: m.MemberId,
          name: member?.GivenName ?? "Unknown",
          isPaid: m.IsPaid,
        };
      });

    return {
      paymentGroupId: group.PaymentGroupId,
      title: group.Title,
      amountPerPerson: Number(group.AmountPerPerson),
      members: groupMembers,
    };
  });

  // -----------------------------
  // UI
  // -----------------------------

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="container mx-auto px-4 flex-1 py-10">
        <div className="mt-6 space-y-8">

          <MembershipPaymentGrid members={gridMembers} />

          {/* 🔥 SIDE BY SIDE SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CasualMembershipPaymentGrid
              casualInvoices={casualInvoiceGroups}
            />

            <PaymentGroupGrid groups={paymentGroupData} />
          </div>

        </div>
      </div>
    </SidebarProvider>
  );
}