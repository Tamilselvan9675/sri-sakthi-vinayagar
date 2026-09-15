"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { templeSettingsSchema, TempleSettingsFormValues } from "@/lib/validations/settings";
import { updateTempleSettings } from "@/app/[locale]/admin/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { TempleSettings } from "@/generated/prisma/client";

interface SettingsFormProps {
  initialData?: TempleSettings | null;
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(templeSettingsSchema),
    defaultValues: initialData ? {
      templeNameEn: initialData.templeNameEn,
      templeNameTa: initialData.templeNameTa,
      addressEn: initialData.addressEn || "",
      addressTa: initialData.addressTa || "",
      phone: initialData.phone || "",
      whatsapp: initialData.whatsapp || "",
      email: initialData.email || "",
      latitude: initialData.latitude || 0,
      longitude: initialData.longitude || 0,
      upiId: initialData.upiId || "",
      qrCodeUrl: initialData.qrCodeUrl || "",
      logoUrl: initialData.logoUrl || "",
    } : {
      templeNameEn: "",
      templeNameTa: "",
      addressEn: "",
      addressTa: "",
      phone: "",
      whatsapp: "",
      email: "",
      latitude: 0,
      longitude: 0,
      upiId: "",
      qrCodeUrl: "",
      logoUrl: "",
    },
  });

  const onSubmit = async (data: TempleSettingsFormValues) => {
    setError(null);
    setSuccess(false);
    try {
      const response = await updateTempleSettings(data);

      if (response.error) {
        setError(response.error);
        return;
      }

      setSuccess(true);
      router.refresh();
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("An unexpected error occurred.");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl bg-card p-6 rounded-lg border border-border shadow-sm">
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="p-3 text-sm text-green-700 bg-green-100 rounded-md flex items-center gap-2 border border-green-200">
          <span className="font-semibold">Settings updated successfully!</span>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-bold border-b pb-2">General Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="templeNameEn">Temple Name (English)</Label>
            <Input id="templeNameEn" {...form.register("templeNameEn")} />
            {form.formState.errors.templeNameEn && (
              <p className="text-xs text-destructive">{form.formState.errors.templeNameEn.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="templeNameTa">Temple Name (Tamil)</Label>
            <Input id="templeNameTa" {...form.register("templeNameTa")} />
            {form.formState.errors.templeNameTa && (
              <p className="text-xs text-destructive">{form.formState.errors.templeNameTa.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold border-b pb-2">Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="addressEn">Address (English)</Label>
            <Input id="addressEn" {...form.register("addressEn")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressTa">Address (Tamil)</Label>
            <Input id="addressTa" {...form.register("addressTa")} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude</Label>
            <Input id="latitude" type="number" step="any" {...form.register("latitude")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input id="longitude" type="number" step="any" {...form.register("longitude")} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold border-b pb-2">Contact & Media</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" {...form.register("phone")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp Number</Label>
            <Input id="whatsapp" {...form.register("whatsapp")} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register("email")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input id="logoUrl" type="url" {...form.register("logoUrl")} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold border-b pb-2">Donations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="upiId">UPI ID</Label>
            <Input id="upiId" {...form.register("upiId")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="qrCodeUrl">QR Code URL</Label>
            <Input id="qrCodeUrl" type="url" {...form.register("qrCodeUrl")} />
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4 border-t border-border">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </form>
  );
}
