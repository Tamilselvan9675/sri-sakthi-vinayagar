import { PaymentProvider, CreateOrderParams, PaymentOrderResult } from "./types";
import { ManualUpiProvider } from "./providers/ManualUpiProvider";
import { db } from "@/lib/db";
import { PaymentStatus } from "@/generated/prisma/client";

export class PaymentService {
  private providers: Map<string, PaymentProvider> = new Map();

  constructor() {
    // Register active providers here
    const upiProvider = new ManualUpiProvider();
    this.providers.set(upiProvider.name, upiProvider);
  }

  getProvider(name: string): PaymentProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Payment provider ${name} is not registered or supported.`);
    }
    return provider;
  }

  async createPayment(providerName: string, params: CreateOrderParams): Promise<PaymentOrderResult> {
    const provider = this.getProvider(providerName);
    
    // Delegate to the specific provider
    const orderResult = await provider.createOrder(params);
    
    return orderResult;
  }

  async processWebhook(providerName: string, payload: string, signature: string): Promise<boolean> {
    const provider = this.getProvider(providerName);
    
    const result = await provider.verifyWebhook(payload, signature);
    
    if (!result.isValid) {
      console.error(`Webhook verification failed for provider ${providerName}:`, result.error);
      return false;
    }

    // Process valid webhook - update the DB
    try {
      const existing = await db.donation.findUnique({ where: { id: result.referenceId } });
      if (!existing) {
        console.error("Webhook referenced non-existent donation ID:", result.referenceId);
        return false;
      }

      // We only allow state transitions if the current status is PENDING,
      // or if transitioning to a terminal state like REFUNDED.
      if (existing.status !== PaymentStatus.PENDING && result.status === PaymentStatus.COMPLETED) {
        console.warn(`Donation ${existing.id} is already ${existing.status}. Ignoring COMPLETED webhook.`);
        return true; 
      }

      await db.donation.update({
        where: { id: result.referenceId },
        data: {
          status: result.status,
          paymentReference: result.providerOrderId,
          updatedAt: new Date()
        }
      });

      return true;
    } catch (dbError) {
      console.error("Database error while processing webhook:", dbError);
      return false;
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
