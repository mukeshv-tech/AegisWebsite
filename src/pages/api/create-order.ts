export const prerender = false;

import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const { amount, currency = "INR", receipt } = body;

    // STEP 1 ERROR HANDLING: Validate amount >= 100 paise
    const parsedAmount = parseInt(amount, 10);
    if (isNaN(parsedAmount) || parsedAmount < 100) {
      return new Response(
        JSON.stringify({ error: "Invalid amount. Minimum amount is 100 paise (₹1.00)." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_TNbJmoow265Zb0";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "Md8tev4O4xeMWelvMgS2dzoC";

    if (!keyId || !keySecret) {
      return new Response(
        JSON.stringify({ error: "Razorpay credentials not configured in environment." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Call Razorpay API: POST https://api.razorpay.com/v1/orders
    const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        amount: parsedAmount,
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
      }),
    });

    const razorpayData = await razorpayResponse.json();

    if (!razorpayResponse.ok) {
      return new Response(
        JSON.stringify({
          error: razorpayData.error?.description || "Failed to create order with Razorpay",
          details: razorpayData.error,
        }),
        { status: razorpayResponse.status || 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Return: { order_id, amount, currency }
    return new Response(
      JSON.stringify({
        success: true,
        order_id: razorpayData.id,
        amount: razorpayData.amount,
        currency: razorpayData.currency,
        key_id: keyId,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error creating Razorpay order." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
