"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { PaymentStatus } from "@/generated/prisma/client";

async function requireFinanceManager() {
  const session = await auth();
  const role = session?.user?.role;
  if (!session || !role || !["SUPER_ADMIN", "FINANCE_MANAGER"].includes(role)) {
    throw new Error("Unauthorized");
  }
}

export async function verifyDonation(id: string, status: PaymentStatus) {
  await requireFinanceManager();
  
  try {
    const existing = await db.donation.findUnique({ where: { id } });
    if (!existing) return { error: "Donation not found" };

    if (existing.status !== PaymentStatus.PENDING) {
      return { error: `Donation is already ${existing.status}` };
    }

    const updated = await db.donation.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date()
      }
    });

    revalidatePath("/admin/donations");
    revalidatePath("/en/admin/donations");
    revalidatePath("/ta/admin/donations");
    
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error verifying donation:", error);
    return { error: "Failed to update donation status" };
  }
}
