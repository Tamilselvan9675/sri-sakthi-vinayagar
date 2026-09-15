// No prisma imports needed
import { Decimal } from "decimal.js";
import { paymentService } from "../lib/payments/PaymentService";
// ManualUpiProvider is automatically registered by the service

async function runTests() {
  console.log("Running Payment Service Verification...");

  const params = {
    amount: new Decimal("1500.00"),
    donorName: "Test Devotee",
    referenceId: "donation-12345"
  };

  try {
    // 1. Create order
    const order = await paymentService.createPayment("MANUAL_UPI", params);
    
    if (order.providerOrderId === "UPI-donation-12345" && order.qrData?.includes("upi://pay")) {
      console.log("✅ Test 1 Passed: Order creation generates correct UPI link and ID");
    } else {
      console.error("❌ Test 1 Failed: Incorrect order creation result", order);
    }

    // 2. Webhook verification for Manual UPI (Should naturally reject since it's unsupported)
    const webhookResult = await paymentService.getProvider("MANUAL_UPI").verifyWebhook("payload", "sig");
    if (!webhookResult.isValid && webhookResult.error) {
      console.log("✅ Test 2 Passed: Manual UPI safely rejects arbitrary automated webhooks");
    } else {
      console.error("❌ Test 2 Failed: Manual UPI webhook accepted unexpectedly");
    }

    console.log("All mocked state tests completed successfully.");
  } catch (err) {
    console.error("Test execution failed:", err);
  }
}

runTests();
