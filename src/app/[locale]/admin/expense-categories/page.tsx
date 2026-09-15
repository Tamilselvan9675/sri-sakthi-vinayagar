import { db } from "@/lib/db";
import ExpenseCategoriesClient from "./client";

export default async function ExpenseCategoriesPage() {
  const categories = await db.expenseCategory.findMany({
    orderBy: { nameEn: "asc" }
  });

  return <ExpenseCategoriesClient categories={categories} />;
}
