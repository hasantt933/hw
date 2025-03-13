// app/api/create-subscription/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received request:", body);

    if (!body.selectedPlan) {
      return NextResponse.json({ error: "Missing selectedPlan" }, { status: 400 });
    }

    // Get the correct price ID based on the selected plan
    const priceId =
      body.selectedPlan === "monthly"
        ? process.env.STRIPE_MONTHLY_PLAN_ID
        : process.env.STRIPE_YEARLY_PLAN_ID;

    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing`,
      metadata: {
        plan: body.selectedPlan // Store the plan in metadata for reference
      }
    });

    return NextResponse.json({ sessionId: session.id }, { status: 200 });
  } catch (error: any) {
    console.error("Stripe Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}