"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { expenseSchema, ExpenseFormValues } from "@/lib/validations/expense";
import { createExpense, updateExpense } from "@/app/[locale]/admin/expenses/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Expense, FestivalYear, ExpenseCategory } from "@/generated/prisma/client";

interface ExpenseFormProps {
  initialData?: Omit<Expense, "amount" | "expenseDate" | "createdAt" | "updatedAt"> & {
    amount: number;
    expenseDate: string;
    createdAt?: string;
    updatedAt?: string;
  } | null;
  locale: string;
  festivalYears: FestivalYear[];
  categories: ExpenseCategory[];
}

export function ExpenseForm({ initialData, locale, festivalYears, categories }: ExpenseFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: initialData ? {
      festivalYearId: initialData.festivalYearId,
      categoryId: initialData.categoryId,
      descriptionEn: initialData.descriptionEn,
      descriptionTa: initialData.descriptionTa,
      amount: Number(initialData.amount),
      expenseDate: new Date(initialData.expenseDate).toISOString().split('T')[0] as unknown as Date,
      receiptUrl: initialData.receiptUrl || "",
      notes: initialData.notes || "",
    } : {
      festivalYearId: festivalYears[0]?.id || "",
      categoryId: categories[0]?.id || "",
      descriptionEn: "",
      descriptionTa: "",
      amount: 0,
      expenseDate: new Date().toISOString().split('T')[0] as unknown as Date,
      receiptUrl: "",
      notes: "",
    },
  });

  const onSubmit = async (data: ExpenseFormValues) => {
    setError(null);
    try {
      const response = initialData 
        ? await updateExpense(initialData.id, data)
        : await createExpense(data);

      if (response.error) {
        setError(response.error);
        return;
      }

      router.push(`/${locale}/admin/expenses`);
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred.");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-4xl bg-card p-6 rounded-lg border border-border shadow-sm">
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="festivalYearId">Festival Year</Label>
          <select 
            id="festivalYearId" 
            {...form.register("festivalYearId")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select Year</option>
            {festivalYears.map(year => (
              <option key={year.id} value={year.id}>{year.titleEn} ({year.year})</option>
            ))}
          </select>
          {form.formState.errors.festivalYearId && (
            <p className="text-xs text-destructive">{form.formState.errors.festivalYearId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoryId">Category</Label>
          <select 
            id="categoryId" 
            {...form.register("categoryId")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nameEn} ({cat.nameTa})</option>
            ))}
          </select>
          {form.formState.errors.categoryId && (
            <p className="text-xs text-destructive">{form.formState.errors.categoryId.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="descriptionEn">Description (English)</Label>
          <Input id="descriptionEn" {...form.register("descriptionEn")} />
          {form.formState.errors.descriptionEn && (
            <p className="text-xs text-destructive">{form.formState.errors.descriptionEn.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="descriptionTa">Description (Tamil)</Label>
          <Input id="descriptionTa" {...form.register("descriptionTa")} />
          {form.formState.errors.descriptionTa && (
            <p className="text-xs text-destructive">{form.formState.errors.descriptionTa.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (₹)</Label>
          <Input id="amount" type="number" step="0.01" {...form.register("amount")} />
          {form.formState.errors.amount && (
            <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="expenseDate">Expense Date</Label>
          <Input id="expenseDate" type="date" {...form.register("expenseDate")} />
          {form.formState.errors.expenseDate && (
            <p className="text-xs text-destructive">{form.formState.errors.expenseDate.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="receiptUrl">Receipt URL</Label>
          <Input id="receiptUrl" type="url" {...form.register("receiptUrl")} />
          {form.formState.errors.receiptUrl && (
            <p className="text-xs text-destructive">{form.formState.errors.receiptUrl.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Internal Notes</Label>
        <Input id="notes" {...form.register("notes")} />
      </div>

      <div className="flex gap-4 pt-4 border-t border-border">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : (initialData ? "Update Expense" : "Log Expense")}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push(`/${locale}/admin/expenses`)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
