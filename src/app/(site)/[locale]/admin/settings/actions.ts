"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { templeSettingsSchema, TempleSettingsFormValues } from "@/lib/validations/settings";
import { revalidatePath } from "next/cache";

async function requireSuperAdmin() {
  const session = await auth();
  const role = session?.user?.role;
  if (!session || role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: Only Super Admin can modify settings");
  }
}

export async function updateTempleSettings(data: TempleSettingsFormValues) {
  await requireSuperAdmin();
  
  const parsed = templeSettingsSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid form data", details: parsed.error.flatten() };
  }

  try {
    const existing = await db.templeSettings.findFirst();

    if (existing) {
      await db.templeSettings.update({
        where: { id: existing.id },
        data: parsed.data
      });
    } else {
      await db.templeSettings.create({
        data: parsed.data
      });
    }

    revalidatePath("/", "layout");
    
    return { success: true };
  } catch (error) {
    console.error("Error updating temple settings:", error);
    return { error: "Failed to update settings" };
  }
}
