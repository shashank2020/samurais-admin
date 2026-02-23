import { memberSubscriptionTypes } from "@/app/types/enums/memberSubscriptionTypes";

export function periodKeyToTermText(
  periodKey: string | null,
  subscriptionType: memberSubscriptionTypes | null,
  sessionDate?: Date
): string {
  if (subscriptionType === memberSubscriptionTypes.Casual) {
    return sessionDate
      ? `Session on ${sessionDate.toLocaleDateString("en-NZ", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}`
      : "Casual session";
  }

  if (!periodKey) return "";

  switch (subscriptionType) {
    case memberSubscriptionTypes.Monthly: {
      // periodKey: "2026-03"
      const [yearStr, monthStr] = periodKey.split("-");
      const year = Number(yearStr);
      const month = Number(monthStr) - 1; // JS Date month is 0-indexed

      return new Date(year, month).toLocaleString("en-NZ", {
        month: "long",
        year: "numeric",
      });
    }

    case memberSubscriptionTypes.SemiAnnual: {
      // periodKey: "2026-H1" or "2026-H2"
      const [yearStr, half] = periodKey.split("-");
      const year = Number(yearStr);

      if (half === "H1") return `Jan – Jun ${year}`;
      if (half === "H2") return `Jul – Dec ${year}`;
      return periodKey; // fallback
    }

    case memberSubscriptionTypes.Annual:
      // periodKey: "2026"
      return periodKey;

    default:
      return periodKey;
  }
}