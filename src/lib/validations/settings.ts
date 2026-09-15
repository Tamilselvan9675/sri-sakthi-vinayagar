import { z } from "zod";

export const templeSettingsSchema = z.object({
  templeNameEn: z.string().min(2, "Temple name is required"),
  templeNameTa: z.string().min(2, "Temple name is required"),
  addressEn: z.string().min(5, "Address is required"),
  addressTa: z.string().min(5, "Address is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  whatsapp: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  upiId: z.string().optional().nullable(),
  qrCodeUrl: z.string().url().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
});

export type TempleSettingsFormValues = z.infer<typeof templeSettingsSchema>;
