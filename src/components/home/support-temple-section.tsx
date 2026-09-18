"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "motion/react";
import { Messages } from "@/i18n/get-messages";
import { MotionButton } from "./motion-button";
import { Heart, Copy, Check, QrCode } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";

interface SupportTempleSectionProps {
  locale: string;
  messages: Messages;
  settings: {
    qrCodeUrl?: string | null;
    upiId?: string | null;
  } | null;
}

export function SupportTempleSection({
  locale,
  messages,
  settings,
}: SupportTempleSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -100px 0px" });
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (settings?.upiId) {
      navigator.clipboard.writeText(settings.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const title = locale === "ta" ? messages.home.donations : "Support the Temple";
  const desc = locale === "ta"
    ? messages.home.donationsDesc
    : "Your contribution helps us continue our poojas, festivals, temple activities and community services. Every offering, small or large, is deeply appreciated.";

  return (
    <motion.section
      ref={ref}
      className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-card to-background border border-primary/20 shadow-xl shadow-primary/5"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Decorative Background Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-temple-gold/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/3" />

      {/* Devotional Watermark */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 text-[300px] text-primary/[0.03] font-serif pointer-events-none select-none">
        ॐ
      </div>

      <div className="relative z-10 p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

        {/* Left Content */}
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <SectionHeader
            title={title}
            subtitle="Secure & Easy UPI Donation"
            icon={Heart}
            align="left"
            className="lg:items-start lg:text-left items-center text-center"
          />

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
            {desc}
          </p>

          <div className="pt-6 flex flex-wrap justify-center lg:justify-start gap-4">
            <Link href={`/${locale}/donations`}>
              <MotionButton variant="premium-gold" className="px-8 py-3.5 shadow-lg shadow-temple-gold/20 text-sm group">
                <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {messages.common.donate}
              </MotionButton>
            </Link>
          </div>
        </div>

        {/* Right: Premium UPI Card */}
        {settings?.qrCodeUrl && (
          <div className="flex-shrink-0 w-full max-w-xs mx-auto lg:mx-0">
            <motion.div
              className="relative rounded-3xl p-6 bg-white shadow-2xl border-4 border-temple-gold/20 flex flex-col items-center group overflow-hidden"
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-temple-gold/5 pointer-events-none" />

              <div className="w-full flex items-center justify-between mb-5 border-b border-neutral-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-green-100 text-green-700 rounded-lg">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-neutral-600 uppercase tracking-widest">Scan & Pay</span>
                </div>
                <span className="text-xs font-bold text-neutral-400">UPI</span>
              </div>

              <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-neutral-100 relative z-10 group-hover:shadow-md transition-shadow">
                <Image
                  src={settings.qrCodeUrl}
                  alt="Temple UPI QR Code"
                  width={200}
                  height={200}
                  className="w-44 h-44 sm:w-52 sm:h-52 object-contain"
                />
              </div>

              {settings.upiId && (
                <div className="mt-5 w-full relative z-10">
                  <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider text-center mb-2">Temple UPI ID</p>
                  <button
                    onClick={handleCopy}
                    className="w-full py-3 px-4 bg-neutral-50 hover:bg-neutral-100 active:bg-neutral-200 rounded-xl border border-neutral-200 flex items-center justify-between transition-colors group/btn"
                  >
                    <span className="font-mono text-sm font-bold text-neutral-700 truncate">{settings.upiId}</span>
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600 shrink-0" />
                    ) : (
                      <Copy className="w-4 h-4 text-neutral-400 group-hover/btn:text-neutral-700 shrink-0 transition-colors" />
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </motion.section>
  );
}
