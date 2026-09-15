"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { expenseSchema, ExpenseFormValues } from "@/lib/validations/expense";
import { revalidatePath } from "next/cache";

async function requireFinanceManager() {
  const session = await auth();
  const role = session?.user?.role;
  const userId = session?.user?.id;
  if (!session || !userId || !role || !["SUPER_ADMIN", "FINANCE_MANAGER"].includes(role)) {
    throw new Error("Unauthorized");
  }
  return userId;
}

export async function createExpense(data: ExpenseFormValues) {
  const userId = await requireFinanceManager();
  
  const parsed = expenseSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid form data", details: parsed.error.flatten() };
  }

  try {
    const expense = await db.expense.create({
      data: parsed.data
    });

    // Audit log
    await db.auditLog.create({
      data: {
        userId,
        action: "CREATE",
        entityType: "Expense",
        entityId: expense.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        newValue: parsed.data as any,
      }
    });

    revalidatePath("/admin/expenses");
    revalidatePath("/en/admin/expenses");
    revalidatePath("/ta/admin/expenses");
    revalidatePath(`/[locale]/expenses/[year]`, "page");
    
    return { success: true, data: expense };
  } catch (error) {
    console.error("Error creating expense:", error);
    return { error: "Failed to create expense" };
  }
}

export async function updateExpense(id: string, data: ExpenseFormValues) {
  const userId = await requireFinanceManager();
  
  const parsed = expenseSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid form data", details: parsed.error.flatten() };
  }

  try {
    const existing = await db.expense.findUnique({ where: { id } });
    if (!existing) return { error: "Expense not found" };

    const expense = await db.expense.update({
      where: { id },
      data: parsed.data
    });

    // Audit log
    await db.auditLog.create({
      data: {
        userId,
        action: "UPDATE",
        entityType: "Expense",
        entityId: expense.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        oldValue: existing as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        newValue: parsed.data as any,
      }
    });

    revalidatePath("/admin/expenses");
    revalidatePath("/en/admin/expenses");
    revalidatePath("/ta/admin/expenses");
    revalidatePath(`/[locale]/expenses/[year]`, "page");
    
    return { success: true, data: expense };
  } catch (error) {
    console.error("Error updating expense:", error);
    return { error: "Failed to update expense" };
  }
}

export async function deleteExpense(id: string) {
  const userId = await requireFinanceManager();
  
  try {
    const existing = await db.expense.findUnique({ where: { id } });
    if (!existing) return { error: "Expense not found" };

    await db.expense.delete({
      where: { id }
    });

    // Audit log
    await db.auditLog.create({
      data: {
        userId,
        action: "DELETE",
        entityType: "Expense",
        entityId: id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        oldValue: existing as any,
      }
    });

    revalidatePath("/admin/expenses");
    revalidatePath("/en/admin/expenses");
    revalidatePath("/ta/admin/expenses");
    revalidatePath(`/[locale]/expenses/[year]`, "page");
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting expense:", error);
    return { error: "Cannot delete this expense." };
  }
}
