import { PaymentStatus, PaymentMethod } from "@/generated/prisma/client";
import { Decimal } from "decimal.js";

export interface CreateOrderParams {
  amount: Decimal;
  currency?: string;
  donorName?: string;
  donorPhone?: string;
  festivalYearId?: string;
  referenceId: string; // Internal DB ID of the pending donation
}

export interface PaymentOrderResult {
  providerOrderId: string;
  providerType: string;
  paymentUrl?: string; // e.g., Razorpay checkout URL or UPI deep link
  qrData?: string;     // Raw string for generating a QR code (e.g. upi://pay...)
}

export interface WebhookVerificationResult {
  isValid: boolean;
  referenceId: string; // The internal donation ID mapped to this webhook
  providerOrderId: string;
  status: PaymentStatus;
  amount?: Decimal;
  error?: string;
}

export interface PaymentProvider {
  name: string;
  supportedMethods: PaymentMethod[];
  
  /** Initialize a payment order with the provider */
  createOrder(params: CreateOrderParams): Promise<PaymentOrderResult>;
  
  /** Verify a webhook signature and extract the canonical status */
  verifyWebhook(payload: string, signature: string): Promise<WebhookVerificationResult>;
}
