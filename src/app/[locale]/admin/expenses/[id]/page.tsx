import { db } from "@/lib/db";
import { ExpenseForm } from "@/components/admin/expense-form";
import { notFound } from "next/navigation";

export default async function EditExpensePage(props: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await props.params;

  const [expense, festivalYears, categories] = await Promise.all([
    db.expense.findUnique({ where: { id } }),
    db.festivalYear.findMany({ orderBy: { year: "desc" } }),
    db.expenseCategory.findMany({ orderBy: { nameEn: "asc" } })
  ]);

  if (!expense) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Expense</h1>
        <p className="text-muted-foreground mt-2">
          Update the expense record. This action will be recorded in the audit log.
        </p>
      </div>

      <ExpenseForm 
        initialData={{
          ...expense,
          amount: Number(expense.amount),
          expenseDate: expense.expenseDate.toISOString(),
          createdAt: expense.createdAt.toISOString(),
          updatedAt: expense.updatedAt.toISOString(),
        }} 
        locale={locale} 
        festivalYears={festivalYears} 
        categories={categories} 
      />
    </div>
  );
}
