import { useMutation } from "@tanstack/react-query";

export function useMarkPaymentGroupMemberAsPaid() {
  return useMutation({
    mutationFn: async (paymentGroupMemberId: number) => {
      const res = await fetch("/api/paymentGroups/markPaid", {
        method: "POST",
        body: JSON.stringify({ paymentGroupMemberId }),
      });

      if (!res.ok) {
        throw new Error("Failed to mark as paid");
      }
    },
  });
}