"use server";

import { db } from "@/lib/db";
import { donationSchema, DonationFormValues } from "@/lib/validations/donation";
import { paymentService } from "@/lib/payments/PaymentService";
import { PaymentStatus, PaymentMethod, Prisma } from "@/generated/prisma/client";

export async function createDonationOrder(data: DonationFormValues) {
  const parsed = donationSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid form data", details: parsed.error.flatten() };
  }

  try {
    // Determine the active festival year if not provided
    let festivalYearId = parsed.data.festivalYearId;
    if (!festivalYearId) {
      const activeYear = await db.festivalYear.findFirst({
        orderBy: { year: 'desc' }
      });
      festivalYearId = activeYear?.id;
    }

    // Create the donation record with PENDING state
    const donation = await db.donation.create({
      data: {
        donorName: parsed.data.donorName,
        donorPhone: parsed.data.donorPhone,
        amount: new Prisma.Decimal(parsed.data.amount),
        paymentMethod: parsed.data.paymentMethod,
        status: PaymentStatus.PENDING,
        festivalYearId: festivalYearId,
      }
    });

    // Create the order via the PaymentService
    // Right now we map UPI -> MANUAL_UPI provider
    const providerName = parsed.data.paymentMethod === PaymentMethod.UPI ? "MANUAL_UPI" : "MANUAL_UPI";
    
    const orderResult = await paymentService.createPayment(providerName, {
      amount: new Prisma.Decimal(parsed.data.amount),
      donorName: parsed.data.donorName || undefined,
      donorPhone: parsed.data.donorPhone || undefined,
      festivalYearId: festivalYearId || undefined,
      referenceId: donation.id,
    });

    return { 
      success: true, 
      order: orderResult,
      donationId: donation.id
    };
  } catch (error) {
    console.error("Error creating donation order:", error);
    return { error: "Failed to initialize payment. Please try again later." };
  }
}
