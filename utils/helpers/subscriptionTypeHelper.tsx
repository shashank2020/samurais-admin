import { memberSubscriptionTypes } from "@/app/types/enums/memberSubscriptionTypes";

/**
 * Convert subscription type string to enum value
 * @param typeStr e.g. "monthly", "semiannual", "annual", "casual"
 */
export function subscriptionTypeFromString(
  typeStr: string | null
): memberSubscriptionTypes | null {
  const normalized = typeStr?.trim().toLowerCase();

  switch (normalized) {
    case "casual":
      return memberSubscriptionTypes.Casual;
    case "monthly":
      return memberSubscriptionTypes.Monthly;
    case "semiannual":
    case "semi-annual":
    case "semi":
      return memberSubscriptionTypes.SemiAnnual;
    case "annual":
    case "yearly":
      return memberSubscriptionTypes.Annual;
    default:
      return null; // unknown type
  }
}
