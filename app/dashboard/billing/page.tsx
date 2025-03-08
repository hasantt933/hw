// Billing Page: app/dashboard/billing/page.tsx
"use client";
import React, { useState } from "react";
import axios from "axios";
import { Loader2Icon } from "lucide-react";

const BillingPage = () => {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("monthly");

  
  const CreateSubscription = async () => {
    setLoading(true);
    try {
        const response = await axios.post('/api/create-subscription', {
            selectedPlan: selectedPlan, // Pass monthly/yearly dynamically
        });
        console.log(response.data);
        OnPayment(response.data.sessionId);
    } catch (error) {
        console.error("Subscription Error:", error);
        setLoading(false);
    }
};

const OnPayment = (sessionId: string) => {
    const stripe = window.Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
    stripe.redirectToCheckout({ sessionId });
};


  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <script src="https://js.stripe.com/v3/"></script>
      <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-6">Upgrade With Monthly Plan</h2>
        <div className="flex gap-6 justify-center">
          <div
            className={`border-4 p-6 rounded-lg cursor-pointer w-64 text-center transition-all ${selectedPlan === "free" ? "border-purple-600" : "border-gray-300"}`}
            onClick={() => setSelectedPlan("free")}
          >
            <h3 className="text-xl font-bold">Monthly</h3>
            <p className="text-2xl font-semibold">9.99$ /month</p>
            <ul className="mt-3 text-sm space-y-1">
              <li>✅ 10,000 Words/Month</li>
              <li>✅ 50+ Content Templates</li>
              <li>✅ Unlimited Download & Copy</li>
              <li>✅ 1 Month of History</li>
            </ul>
            <button className={`mt-4 px-4 py-2 rounded-lg text-white ${selectedPlan === "free" ? "bg-purple-600" : "bg-gray-400"}`}>Currently Active Plan</button>
          </div>
          <div
            className={`border-4 p-6 rounded-lg cursor-pointer w-64 text-center transition-all ${selectedPlan === "monthly" ? "border-purple-600" : "border-gray-300"}`}
            onClick={() => setSelectedPlan("monthly")}
          >
            <h3 className="text-xl font-bold">Yearly</h3>
            <p className="text-2xl font-semibold">39.99$ /month</p>
            <ul className="mt-3 text-sm space-y-1">
              <li>✅ 1,00,000 Words/Month</li>
              <li>✅ 50+ Template Access</li>
              <li>✅ Unlimited Download & Copy</li>
              <li>✅ 1 Year of History</li>
            </ul>
            <button
              disabled={loading}
              onClick={()=>CreateSubscription()}
              className={`mt-4 px-4 py-2 rounded-lg text-white ${selectedPlan === "monthly" ? "bg-purple-600" : "bg-gray-400"}`}
            >
              {loading && <Loader2Icon className="animate-spin" />} Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;
