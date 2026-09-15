"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { expenseCategorySchema, ExpenseCategoryFormValues } from "@/lib/validations/expense";
import { createExpenseCategory, updateExpenseCategory } from "@/app/[locale]/admin/expense-categories/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { ExpenseCategory } from "@/generated/prisma/client";

interface ExpenseCategoryFormProps {
  initialData?: ExpenseCategory | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ExpenseCategoryForm({ initialData, onSuccess, onCancel }: ExpenseCategoryFormProps) {
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<ExpenseCategoryFormValues>({
    resolver: zodResolver(expenseCategorySchema),
    defaultValues: initialData ? {
      nameEn: initialData.nameEn,
      nameTa: initialData.nameTa,
    } : {
      nameEn: "",
      nameTa: "",
    },
  });

  const onSubmit = async (data: ExpenseCategoryFormValues) => {
    setError(null);
    try {
      const response = initialData 
        ? await updateExpenseCategory(initialData.id, data)
        : await createExpenseCategory(data);

      if (response.error) {
        setError(response.error);
        return;
      }

      onSuccess();
      form.reset();
    } catch (err) {
      setError("An unexpected error occurred.");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 bg-card p-6 rounded-lg border border-border shadow-sm">
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nameEn">English Name</Label>
          <Input 
            id="nameEn" 
            {...form.register("nameEn")} 
            placeholder="e.g. Pooja Materials"
          />
          {form.formState.errors.nameEn && (
            <p className="text-xs text-destructive">{form.formState.errors.nameEn.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="nameTa">Tamil Name</Label>
          <Input 
            id="nameTa" 
            {...form.register("nameTa")} 
            placeholder="e.g. பூஜை பொருட்கள்"
          />
          {form.formState.errors.nameTa && (
            <p className="text-xs text-destructive">{form.formState.errors.nameTa.message}</p>
          )}
        </div>
      </div>

      <div className="flex gap-4 pt-2">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : (initialData ? "Update Category" : "Add Category")}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
