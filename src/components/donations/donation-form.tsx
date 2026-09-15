"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { donationSchema, DonationFormValues } from "@/lib/validations/donation";
import { createDonationOrder } from "@/app/[locale]/donations/actions";
// Removed Prisma import to prevent Turbopack node leak
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Smartphone, CheckCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export function DonationForm({ locale }: { locale: string }) {
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<{ url?: string; qr?: string; id: string } | null>(null);
  
  const form = useForm({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      donorName: "",
      donorPhone: "",
      amount: 100,
      paymentMethod: "UPI",
    },
  });

  const onSubmit = async (data: DonationFormValues) => {
    setError(null);
    try {
      const response = await createDonationOrder(data);

      if (response.error || !response.order) {
        setError(response.error || "Failed to initiate payment");
        return;
      }

      setPaymentData({
        url: response.order.paymentUrl,
        qr: response.order.qrData,
        id: response.donationId
      });
    } catch (err) {
      setError("An unexpected error occurred.");
    }
  };

  if (paymentData) {
    return (
      <div className="bg-card p-6 rounded-lg border border-border shadow-sm text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Smartphone className="h-8 w-8 text-primary" />
          </div>
        </div>
        
        <h3 className="text-2xl font-bold">
          {locale === "ta" ? "பணம் செலுத்த" : "Complete Payment"}
        </h3>
        
        <p className="text-muted-foreground max-w-sm mx-auto">
          {locale === "ta" 
            ? "கீழே உள்ள QR குறியீட்டை ஸ்கேன் செய்யவும் அல்லது உங்கள் மொபைலில் செலுத்த பொத்தானை அழுத்தவும்."
            : "Scan the QR code below or tap the button to pay directly using any UPI app."}
        </p>

        {paymentData.qr && (
          <div className="flex justify-center bg-white p-4 rounded-lg inline-block mx-auto border border-border">
            <QRCodeSVG value={paymentData.qr} size={200} level="H" />
          </div>
        )}

        {paymentData.url && (
          <div>
            <Button size="lg" className="w-full sm:w-auto" render={<a href={paymentData.url} />}>
              {locale === "ta" ? "இப்போதே செலுத்துங்கள்" : "Pay Now with UPI"}
            </Button>
          </div>
        )}

        <div className="pt-6 border-t border-border mt-6">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            {locale === "ta" 
              ? "பணம் செலுத்திய பிறகு நிர்வாகி உறுதி செய்வார்." 
              : "Payment will be verified by the temple administration."}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Reference ID: {paymentData.id}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 bg-card p-6 rounded-lg border border-border shadow-sm">
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="amount">{locale === "ta" ? "நன்கொடை தொகை (₹) *" : "Donation Amount (₹) *"}</Label>
        <Input 
          id="amount" 
          type="number" 
          min="1"
          {...form.register("amount")} 
          className="text-lg font-bold"
        />
        {form.formState.errors.amount && (
          <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="donorName">{locale === "ta" ? "பெயர் (விருப்பமானால்)" : "Name (Optional)"}</Label>
        <Input 
          id="donorName" 
          {...form.register("donorName")} 
          placeholder={locale === "ta" ? "உங்கள் பெயர்" : "Your full name"}
        />
        {form.formState.errors.donorName && (
          <p className="text-xs text-destructive">{form.formState.errors.donorName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="donorPhone">{locale === "ta" ? "தொலைபேசி (விருப்பமானால்)" : "Phone Number (Optional)"}</Label>
        <Input 
          id="donorPhone" 
          type="tel"
          {...form.register("donorPhone")} 
          placeholder={locale === "ta" ? "+91..." : "For SMS receipt"}
        />
        {form.formState.errors.donorPhone && (
          <p className="text-xs text-destructive">{form.formState.errors.donorPhone.message}</p>
        )}
      </div>

      <Button type="submit" size="lg" className="w-full mt-4" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting 
          ? (locale === "ta" ? "செயலாக்கப்படுகிறது..." : "Processing...") 
          : (locale === "ta" ? "நன்கொடை அளியுங்கள்" : "Proceed to Donate")
        }
      </Button>
    </form>
  );
}
