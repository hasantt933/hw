// app/api/get-session/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    // Retrieve the checkout session with expanded data
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["customer", "subscription"]
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Extract the customer ID as a string
    let stripeCustomerId = "";
    if (typeof session.customer === "string") {
      stripeCustomerId = session.customer;
    } else if (session.customer && typeof session.customer === "object") {
      stripeCustomerId = session.customer.id;
    }

    // Extract the subscription ID as a string
    let stripeSubscriptionId = "";
    if (typeof session.subscription === "string") {
      stripeSubscriptionId = session.subscription;
    } else if (session.subscription && typeof session.subscription === "object") {
      stripeSubscriptionId = session.subscription.id;
    }

    if (!stripeCustomerId || !stripeSubscriptionId) {
      return NextResponse.json({
        error: "Could not extract customer ID or subscription ID from session"
      }, { status: 400 });
    }

    // Get the plan either from metadata or line items
    let plan = session.metadata?.plan || "monthly"; // Default to monthly

    console.log("Successfully retrieved session data:", {
      stripeCustomerId,
      stripeSubscriptionId,
      plan
    });

    return NextResponse.json({
      stripeCustomerId,
      stripeSubscriptionId,
      plan
    });
  } catch (error: any) {
    console.error("Error retrieving session:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}