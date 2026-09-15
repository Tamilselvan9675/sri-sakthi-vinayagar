import { z } from "zod";

export const donationSchema = z.object({
  donorName: z.string().optional().nullable(),
  donorPhone: z.string().optional().nullable(),
  amount: z.coerce.number().min(1, "Donation amount must be at least ₹1"),
  paymentMethod: z.enum(["CASH", "UPI", "BANK_TRANSFER", "CARD", "ONLINE", "OTHER"]).default("UPI"),
  festivalYearId: z.string().cuid("Invalid festival year").optional().nullable(),
});

export type DonationFormValues = z.infer<typeof donationSchema>;
