"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Loader2Icon } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

const BillingPage = () => {
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("monthly");
  const { user, isLoaded: isUserLoaded } = useUser();
  const searchParams = useSearchParams();
  
  // Handle successful payment return from Stripe
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    
    if (sessionId && isUserLoaded) {
      // Only process payment if user data is loaded
      setProcessingPayment(true);
      // Add a small delay to ensure user data is fully available
      const timer = setTimeout(() => {
        handleSuccessfulPayment(sessionId);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [searchParams, user, isUserLoaded]);
  
  // Handle the successful payment return
  const handleSuccessfulPayment = async (sessionId: string) => {
    setLoading(true);
    try {
      // Retry mechanism for getting user data
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          // Get session details from Stripe
          const sessionResponse = await axios.get(`/api/get-session?session_id=${sessionId}`);
          const { stripeCustomerId, stripeSubscriptionId, plan } = sessionResponse.data;
          
          // Check if user data is available
          if (!user || !user.primaryEmailAddress?.emailAddress) {
            console.log(`User data not ready, retry ${retryCount + 1}/${maxRetries}`);
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
            continue;
          }
          
          if (stripeCustomerId && stripeSubscriptionId) {
            // Save subscription to database
            const saveResponse = await fetch("/api/save-subscription", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: user.primaryEmailAddress?.emailAddress,
                userName: user.fullName || user.username,
                active: true,
                stripeCustomerId,
                stripeSubscriptionId,
                plan,
                currentPeriodEnd: new Date(
                  new Date().setMonth(new Date().getMonth() + (plan === "monthly" ? 1 : 12))
                ).toISOString(),
              }),
            });
            
            const data = await saveResponse.json();
            if (data.success) {
              console.log("Subscription saved successfully.");
              // Redirect to dashboard or subscription success page without query params
              window.location.href = "/dashboard";
            } else {
              console.error("Failed to save subscription:", data.error);
            }
            
            // Exit the retry loop if successful
            break;
          } else {
            console.error("Failed to retrieve customer or subscription ID.");
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(`Error in attempt ${retryCount + 1}:`, error);
          retryCount++;
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      if (retryCount >= maxRetries) {
        console.error("Max retries reached. Unable to process payment.");
        // Optionally redirect to an error page or show an error message
      }
    } catch (error) {
      console.error("Error processing successful payment:", error);
    } finally {
      setLoading(false);
      setProcessingPayment(false);
    }
  };

  // Create a Stripe checkout session
  const createSubscription = async (e: React.MouseEvent, plan: "monthly" | "yearly") => {
    e.stopPropagation(); // Prevent event bubbling to parent div
    setLoading(true);
    try {
      const response = await axios.post("/api/create-subscription", {
        selectedPlan: plan, // Use the passed plan parameter
      });
      
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      if (!stripe) {
        console.error("Stripe failed to initialize.");
        setLoading(false);
        return;
      }
      
      // Redirect to Stripe checkout - this will navigate away from the page
      const { error } = await stripe.redirectToCheckout({ 
        sessionId: response.data.sessionId 
      });
      
      if (error) {
        console.error("Stripe Checkout error:", error);
        setLoading(false);
      }
      // No code should be placed after redirectToCheckout as it won't execute
    } catch (error) {
      console.error("Subscription Error:", error);
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <script src="https://js.stripe.com/v3/"></script>
      <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-lg">
        {processingPayment ? (
          <div className="text-center py-10">
            <Loader2Icon className="animate-spin mx-auto h-10 w-10 text-purple-600" />
            <p className="mt-4 text-xl">Processing your payment...</p>
            <p className="text-gray-500">Please wait while we confirm your subscription</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-center mb-6">Upgrade Your Plan</h2>
            <div className="flex gap-6 justify-center">
              {/* Monthly Plan */}
              <div
                className={`border-4 p-6 rounded-lg cursor-pointer w-64 text-center transition-all ${
                  selectedPlan === "monthly" ? "border-purple-600" : "border-gray-300"
                }`}
                onClick={() => setSelectedPlan("monthly")}
              >
                <h3 className="text-xl font-bold">Monthly</h3>
                <p className="text-2xl font-semibold">$9.99 /month</p>
                <ul className="mt-3 text-sm space-y-1">
                  <li>✅ 10,000 Words/Month</li>
                  <li>✅ 50+ Content Templates</li>
                  <li>✅ Unlimited Download & Copy</li>
                  <li>✅ 1 Month of History</li>
                </ul>
                <button
                  disabled={loading}
                  onClick={(e) => createSubscription(e, "monthly")}
                  className="mt-4 px-4 py-2 rounded-lg text-white bg-purple-600 flex items-center justify-center"
                >
                  {loading && selectedPlan === "monthly" && <Loader2Icon className="animate-spin mr-2" />} 
                  Get Started
                </button>
              </div>

              {/* Yearly Plan */}
              <div
                className={`border-4 p-6 rounded-lg cursor-pointer w-64 text-center transition-all ${
                  selectedPlan === "yearly" ? "border-purple-600" : "border-gray-300"
                }`}
                onClick={() => setSelectedPlan("yearly")}
              >
                <h3 className="text-xl font-bold">Yearly</h3>
                <p className="text-2xl font-semibold">$39.99 /year</p>
                <ul className="mt-3 text-sm space-y-1">
                  <li>✅ 100,000 Words/Month</li>
                  <li>✅ 50+ Template Access</li>
                  <li>✅ Unlimited Download & Copy</li>
                  <li>✅ 1 Year of History</li>
                </ul>
                <button
                  disabled={loading}
                  onClick={(e) => createSubscription(e, "yearly")}
                  className="mt-4 px-4 py-2 rounded-lg text-white bg-purple-600 flex items-center justify-center"
                >
                  {loading && selectedPlan === "yearly" && <Loader2Icon className="animate-spin mr-2" />} 
                  Get Started
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BillingPage;