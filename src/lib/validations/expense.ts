import { z } from "zod";

export const expenseCategorySchema = z.object({
  nameEn: z.string().min(2, "English name is required"),
  nameTa: z.string().min(2, "Tamil name is required"),
});

export type ExpenseCategoryFormValues = z.infer<typeof expenseCategorySchema>;

export const expenseSchema = z.object({
  festivalYearId: z.string().cuid("Invalid festival year"),
  categoryId: z.string().cuid("Invalid category"),
  descriptionEn: z.string().min(3, "English description is required"),
  descriptionTa: z.string().min(3, "Tamil description is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  expenseDate: z.coerce.date(),
  receiptUrl: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
  notes: z.string().optional().nullable(),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;
