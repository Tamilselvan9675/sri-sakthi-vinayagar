"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { expenseCategorySchema, ExpenseCategoryFormValues } from "@/lib/validations/expense";
import { revalidatePath } from "next/cache";

async function requireFinanceManager() {
  const session = await auth();
  const role = session?.user?.role;
  if (!session || !role || !["SUPER_ADMIN", "FINANCE_MANAGER"].includes(role)) {
    throw new Error("Unauthorized");
  }
}

export async function createExpenseCategory(data: ExpenseCategoryFormValues) {
  await requireFinanceManager();
  
  const parsed = expenseCategorySchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid form data", details: parsed.error.flatten() };
  }

  try {
    const category = await db.expenseCategory.create({
      data: parsed.data
    });

    revalidatePath("/admin/expense-categories");
    revalidatePath("/en/admin/expense-categories");
    revalidatePath("/ta/admin/expense-categories");
    
    return { success: true, data: category };
  } catch (error) {
    console.error("Error creating expense category:", error);
    return { error: "Failed to create expense category" };
  }
}

export async function updateExpenseCategory(id: string, data: ExpenseCategoryFormValues) {
  await requireFinanceManager();
  
  const parsed = expenseCategorySchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid form data", details: parsed.error.flatten() };
  }

  try {
    const category = await db.expenseCategory.update({
      where: { id },
      data: parsed.data
    });

    revalidatePath("/admin/expense-categories");
    revalidatePath("/en/admin/expense-categories");
    revalidatePath("/ta/admin/expense-categories");
    
    return { success: true, data: category };
  } catch (error) {
    console.error("Error updating expense category:", error);
    return { error: "Failed to update expense category" };
  }
}

export async function deleteExpenseCategory(id: string) {
  await requireFinanceManager();
  
  try {
    await db.expenseCategory.delete({
      where: { id }
    });

    revalidatePath("/admin/expense-categories");
    revalidatePath("/en/admin/expense-categories");
    revalidatePath("/ta/admin/expense-categories");
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting expense category:", error);
    return { error: "Cannot delete this category. It might be referenced by existing expenses." };
  }
}
