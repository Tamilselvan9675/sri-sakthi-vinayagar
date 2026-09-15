import { z } from "zod";

export const festivalYearSchema = z.object({
  year: z.coerce.number().min(2000).max(2100, "Year must be between 2000 and 2100"),
  titleEn: z.string().min(3, "English title is required"),
  titleTa: z.string().min(3, "Tamil title is required"),
  descriptionEn: z.string().optional().nullable(),
  descriptionTa: z.string().optional().nullable(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).refine((data) => data.endDate >= data.startDate, {
  message: "End date cannot be earlier than start date",
  path: ["endDate"],
});

export type FestivalYearFormValues = z.infer<typeof festivalYearSchema>;
