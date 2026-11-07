"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { festivalYearSchema, FestivalYearFormValues } from "@/lib/validations/festival";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  const role = session?.user?.role;
  if (!session || !role || !["SUPER_ADMIN", "ADMIN", "EDITOR"].includes(role)) {
    throw new Error("Unauthorized");
  }
}

export async function createFestivalYear(data: FestivalYearFormValues) {
  await requireAdmin();
  
  const parsed = festivalYearSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid form data", details: parsed.error.flatten() };
  }

  try {
    const existing = await db.festivalYear.findUnique({
      where: { year: parsed.data.year }
    });

    if (existing) {
      return { error: `Festival year ${parsed.data.year} already exists` };
    }

    const festival = await db.festivalYear.create({
      data: parsed.data
    });

    revalidatePath("/admin/festivals");
    revalidatePath("/en/admin/festivals");
    revalidatePath("/ta/admin/festivals");
    
    return { success: true, data: festival };
  } catch (error) {
    console.error("Error creating festival year:", error);
    return { error: "Failed to create festival year" };
  }
}

export async function updateFestivalYear(id: string, data: FestivalYearFormValues) {
  await requireAdmin();
  
  const parsed = festivalYearSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid form data", details: parsed.error.flatten() };
  }

  try {
    // Check if updating year conflicts with another record
    const existing = await db.festivalYear.findUnique({
      where: { year: parsed.data.year }
    });

    if (existing && existing.id !== id) {
      return { error: `Festival year ${parsed.data.year} already exists` };
    }

    const festival = await db.festivalYear.update({
      where: { id },
      data: parsed.data
    });

    revalidatePath("/admin/festivals");
    revalidatePath("/en/admin/festivals");
    revalidatePath("/ta/admin/festivals");
    
    return { success: true, data: festival };
  } catch (error) {
    console.error("Error updating festival year:", error);
    return { error: "Failed to update festival year" };
  }
}

export async function deleteFestivalYear(id: string) {
  await requireAdmin();
  
  try {
    await db.festivalYear.delete({
      where: { id }
    });

    revalidatePath("/admin/festivals");
    revalidatePath("/en/admin/festivals");
    revalidatePath("/ta/admin/festivals");
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting festival year:", error);
    return { error: "Cannot delete this year. It might be referenced by other records." };
  }
}
