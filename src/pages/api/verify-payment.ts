export const prerender = false;

import type { APIRoute } from "astro";
import crypto from "node:crypto";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    // STEP 3 ERROR HANDLING: Missing fields validation
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(
        JSON.stringify({
          error: "Missing required payment verification fields (razorpay_order_id, razorpay_payment_id, razorpay_signature).",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || "Md8tev4O4xeMWelvMgS2dzoC";

    if (!keySecret) {
      return new Response(
        JSON.stringify({ error: "Razorpay key secret not configured." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(payload)
      .digest("hex");

    // Compare generated signature with razorpay_signature
    const isSignatureValid = generatedSignature === razorpay_signature;

    if (!isSignatureValid) {
      // Signature mismatch: return 400, do NOT mark as paid
      return new Response(
        JSON.stringify({
          success: false,
          error: "Payment verification failed. Invalid signature.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Return success only if signatures match
    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment verified successfully!",
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error verifying Razorpay payment." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
