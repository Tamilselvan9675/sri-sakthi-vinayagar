"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { festivalYearSchema, FestivalYearFormValues } from "@/lib/validations/festival";
import { createFestivalYear, updateFestivalYear } from "@/app/[locale]/admin/festivals/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { FestivalYear } from "@/generated/prisma/client";

interface FestivalFormProps {
  initialData?: FestivalYear | null;
  locale: string;
}

export function FestivalForm({ initialData, locale }: FestivalFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm({
    resolver: zodResolver(festivalYearSchema),
    defaultValues: initialData ? {
      year: initialData.year,
      titleEn: initialData.titleEn,
      titleTa: initialData.titleTa,
      descriptionEn: initialData.descriptionEn || "",
      descriptionTa: initialData.descriptionTa || "",
      startDate: new Date(initialData.startDate),
      endDate: new Date(initialData.endDate),
    } : {
      year: new Date().getFullYear(),
      titleEn: "",
      titleTa: "",
      descriptionEn: "",
      descriptionTa: "",
      startDate: new Date(),
      endDate: new Date(),
    },
  });

  const onSubmit = async (data: FestivalYearFormValues) => {
    setError(null);
    try {
      const response = initialData 
        ? await updateFestivalYear(initialData.id, data)
        : await createFestivalYear(data);

      if (response.error) {
        setError(response.error);
        return;
      }

      router.push(`/${locale}/admin/festivals`);
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred.");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl bg-card p-6 rounded-lg border border-border shadow-sm">
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="year">Festival Year (e.g. 2024)</Label>
        <Input 
          id="year" 
          type="number" 
          {...form.register("year")} 
        />
        {form.formState.errors.year && (
          <p className="text-xs text-destructive">{form.formState.errors.year.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="titleEn">English Title</Label>
          <Input 
            id="titleEn" 
            {...form.register("titleEn")} 
            placeholder="e.g. 45th Year Celebration"
          />
          {form.formState.errors.titleEn && (
            <p className="text-xs text-destructive">{form.formState.errors.titleEn.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="titleTa">Tamil Title</Label>
          <Input 
            id="titleTa" 
            {...form.register("titleTa")} 
            placeholder="e.g. 45 ஆம் ஆண்டு விழா"
          />
          {form.formState.errors.titleTa && (
            <p className="text-xs text-destructive">{form.formState.errors.titleTa.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="descriptionEn">English Description (Optional)</Label>
          <Input 
            id="descriptionEn" 
            {...form.register("descriptionEn")} 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="descriptionTa">Tamil Description (Optional)</Label>
          <Input 
            id="descriptionTa" 
            {...form.register("descriptionTa")} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input 
            id="startDate" 
            type="date"
            {...form.register("startDate")} 
          />
          {form.formState.errors.startDate && (
            <p className="text-xs text-destructive">{form.formState.errors.startDate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input 
            id="endDate" 
            type="date"
            {...form.register("endDate")} 
          />
          {form.formState.errors.endDate && (
            <p className="text-xs text-destructive">{form.formState.errors.endDate.message}</p>
          )}
        </div>
      </div>

      <div className="flex gap-4 pt-4 border-t border-border">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : (initialData ? "Update Festival" : "Create Festival")}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push(`/${locale}/admin/festivals`)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
