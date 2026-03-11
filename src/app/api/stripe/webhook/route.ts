export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { grantCredits } from "@/lib/credit-system";
import { sendPurchaseConfirmation } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.userId;
    const credits = parseInt(session.metadata?.credits || "0", 10);

    if (userId && credits > 0) {
      try {
        await grantCredits(
          "user",
          userId,
          credits,
          "purchase",
          session.payment_intent as string
        );
        console.log(`Granted ${credits} credits to user ${userId}`);

        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true },
        });
        if (user?.email) {
          const { ok, error } = await sendPurchaseConfirmation(user.email, credits);
          if (!ok) console.warn("Purchase confirmation email failed:", error);
        }
      } catch (error) {
        console.error("Failed to grant credits:", error);
        return NextResponse.json(
          { error: "Failed to process payment" },
          { status: 500 }
        );
      }
    }
  }

  return NextResponse.json({ received: true });
}
