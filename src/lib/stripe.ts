import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-02-25.clover",
      typescript: true,
    });
  }
  return _stripe;
}

export const CREDIT_PACKS = [
  {
    id: "pack-200",
    credits: 200,
    priceInCents: 300,
    label: "200 credits",
    description: "A modest signal boost. Enough for careful exploration.",
  },
  {
    id: "pack-500",
    credits: 500,
    priceInCents: 600,
    label: "500 credits",
    description: "Room to breathe. Room to make mistakes.",
  },
  {
    id: "pack-1500",
    credits: 1500,
    priceInCents: 1500,
    label: "1500 credits",
    description: "The full frequency. Explore every branch, every what-if.",
  },
] as const;

export type CreditPackId = (typeof CREDIT_PACKS)[number]["id"];

export function getCreditPack(id: string) {
  return CREDIT_PACKS.find((p) => p.id === id);
}
