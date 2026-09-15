import { PaymentProvider, CreateOrderParams, PaymentOrderResult, WebhookVerificationResult } from "../types";
import { PaymentMethod, PaymentStatus } from "@/generated/prisma/client";
import { db } from "@/lib/db";

export class ManualUpiProvider implements PaymentProvider {
  name = "MANUAL_UPI";
  supportedMethods = [PaymentMethod.UPI];

  async createOrder(params: CreateOrderParams): Promise<PaymentOrderResult> {
    // Fetch UPI ID from Temple Settings
    const settings = await db.templeSettings.findFirst();
    const upiId = settings?.upiId || "temple@upi";
    const templeName = settings?.templeNameEn || "Vinayagar Temple";
    
    const amountStr = params.amount.toFixed(2);
    
    // Construct standard UPI deep link string
    // Format: upi://pay?pa={upi_id}&pn={name}&am={amount}&cu=INR&tr={transaction_ref}
    const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(templeName)}&am=${amountStr}&cu=INR&tr=${params.referenceId}`;

    return {
      providerOrderId: `UPI-${params.referenceId}`,
      providerType: this.name,
      paymentUrl: upiString, 
      qrData: upiString,     
    };
  }

  async verifyWebhook(_payload: string, _signature: string): Promise<WebhookVerificationResult> {
    // Manual UPI does not have automated webhooks from a gateway.
    // Verification is handled manually in the Admin Dashboard.
    // We stub this out to reject arbitrary webhook calls.
    return {
      isValid: false,
      referenceId: "",
      providerOrderId: "",
      status: PaymentStatus.FAILED,
      error: "Manual UPI provider does not support automated webhooks.",
    };
  }
}
