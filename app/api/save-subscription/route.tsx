// app/api/save-subscription/route.ts
import { NextResponse } from "next/server";
import { db } from "@/utils/db"; // Adjust this import based on your database setup
import { subscriptions } from "@/utils/schema"; // Import your schema

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      email, 
      userName, 
      stripeCustomerId, 
      stripeSubscriptionId, 
      active, 
      plan, 
      currentPeriodEnd 
    } = body;
    
    if (!email || !userName || !stripeCustomerId || !stripeSubscriptionId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" }, 
        { status: 400 }
      );
    }
    
    console.log("Saving subscription with data:", {
      email,
      userName,
      active,
      stripeCustomerId,
      stripeSubscriptionId,
      plan,
      currentPeriodEnd
    });
    
    // Insert into the database using your schema
    const result = await db.insert(subscriptions).values({
      email,
      userName,
      active,
      stripeCustomerId,
      stripeSubscriptionId,
      plan,
      currentPeriodEnd: new Date(currentPeriodEnd),
      joinDate: new Date() // This will use the default NOW() if not provided
    }).returning();
    
    return NextResponse.json({ 
      success: true, 
      subscription: result[0]
    });
  } catch (error: any) {
    console.error("Error saving subscription:", error.message);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}