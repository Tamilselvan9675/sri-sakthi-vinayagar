"use client";

import { MessageCircle } from "lucide-react";

interface WhatsAppFabProps {
  phoneNumber?: string;
}

export function WhatsAppFab({ phoneNumber = "" }: WhatsAppFabProps) {
  if (!phoneNumber) return null;

  const digits = phoneNumber.replace(/\D/g, "");
  const cleanNumber = digits.startsWith("91") && digits.length > 10 ? digits : `91${digits.replace(/^0+/, "")}`;
  const href = `https://wa.me/${cleanNumber}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg shadow-green-600/30 hover:bg-green-700 hover:shadow-xl hover:shadow-green-600/40 transition-all duration-300 group"
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />

      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full bg-green-600/40 animate-ping opacity-30" />
    </a>
  );
}
