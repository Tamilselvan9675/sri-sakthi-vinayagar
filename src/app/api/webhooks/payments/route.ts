import { NextResponse } from "next/server";
import { paymentService } from "@/lib/payments/PaymentService";

// Example Mock Webhook endpoint for testing architecture.
// In a real scenario, this is where Razorpay/Stripe would send POST requests.
export async function POST(request: Request) {
  try {
    // 1. Extract payload and signature
    // Normally signature comes from headers: request.headers.get("x-razorpay-signature")
    const payload = await request.text();
    const signature = request.headers.get("x-signature") || "mock-signature";
    
    // We expect the provider name in a query param or header for generic routers
    const { searchParams } = new URL(request.url);
    const providerName = searchParams.get("provider") || "MANUAL_UPI";

    // 2. Process webhook via PaymentService
    const success = await paymentService.processWebhook(providerName, payload, signature);

    if (success) {
      return NextResponse.json({ status: "ok" }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 });
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
