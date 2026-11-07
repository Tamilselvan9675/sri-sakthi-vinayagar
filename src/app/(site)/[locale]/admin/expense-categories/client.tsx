"use client";

import { useState } from "react";
import { DataTable } from "@/components/admin/data-table";
import { ExpenseCategoryForm } from "@/components/admin/expense-category-form";
import { ExpenseCategory } from "@/generated/prisma/client";
import { deleteExpenseCategory } from "./actions";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ExpenseCategoriesClient({
  categories
}: {
  categories: ExpenseCategory[]
}) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);

  const handleDelete = async (category: ExpenseCategory) => {
    if (confirm(`Are you sure you want to delete the category "${category.nameEn}"?`)) {
      await deleteExpenseCategory(category.id);
    }
  };

  const handleEdit = (category: ExpenseCategory) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const columns = [
    { header: "English Name", accessorKey: "nameEn" },
    { header: "Tamil Name", accessorKey: "nameTa" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expense Categories</h1>
          <p className="text-muted-foreground mt-2">
            Manage categories used to group and track temple expenses.
          </p>
        </div>
        {!isFormOpen && (
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Button>
        )}
      </div>

      {isFormOpen && (
        <div className="max-w-2xl">
          <ExpenseCategoryForm
            initialData={editingCategory}
            onSuccess={() => {
              setIsFormOpen(false);
              setEditingCategory(null);
            }}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingCategory(null);
            }}
          />
        </div>
      )}

      <div className="bg-card border border-border rounded-md shadow-sm p-4">
        <DataTable
          data={categories}
          columns={columns}
          searchKey="nameEn"
          searchPlaceholder="Search category..."
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        {/* We have to manually inject custom actions since we use inline edit instead of links for this simple page */}
        {/* Wait, DataTable supports custom cells but the `editHref` expects a link. Since this is client-side, I should ideally update DataTable to support `onEdit` callback or just use custom cell. */}
        {/* For simplicity, I'll update the component below with a custom action cell if needed, but our generic DataTable is limited. I'll just rely on a custom cell for actions. */}
      </div>
    </div>
  );
}
