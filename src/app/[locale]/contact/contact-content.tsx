"use client";

import { MapPin, Phone, Mail, Navigation, ExternalLink } from "lucide-react";
import { motion } from "motion/react";
import { TempleSettings } from "@/generated/prisma/client";
import { SOCIAL_LINKS } from "@/lib/constants/social";
import { MotionButton } from "@/components/home/motion-button";
import { FeedbackForm } from "./feedback-form";
import { Messages } from "@/i18n/get-messages";

// Custom SVG Icons for WhatsApp and Instagram to avoid oversized lucide generic icons
function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

interface ContactContentProps {
  locale: string;
  messages: Messages;
  settings: TempleSettings | null;
}

export function ContactContent({ locale, messages, settings }: ContactContentProps) {
  const phone = settings?.phone || "9600145775";
  const whatsapp = settings?.whatsapp || phone;
  const email = settings?.email || "info@sakthivinayagar.org";
  const addressEn = settings?.addressEn || "Sri Sakthi Vinayagar Temple, Kulakarai Street, Kadambadi Post, Mamallapuram, Chengalpattu - 603104";
  const addressTa = settings?.addressTa || addressEn;
  const instagram = SOCIAL_LINKS.instagram;

  const prefilledMessage = encodeURIComponent(
    locale === "ta"
      ? "வணக்கம், நான் ஸ்ரீ சக்தி விநாயகர் கோயிலைப் பற்றி மேலும் அறிய விரும்புகிறேன்."
      : "Hello, I would like to know more about Sri Sakthi Vinayagar Temple."
  );

  const contactCards = [
    {
      id: "phone",
      icon: Phone,
      title: locale === "ta" ? "அழைக்க" : "Call Us",
      value: phone,
      desc: locale === "ta" ? "கோயில் தொடர்புக்கு" : "For temple enquiries",
      href: `tel:${phone}`,
      glowColor: "group-hover:shadow-[0_10px_40px_-10px_rgba(212,175,55,0.4),0_0_20px_-5px_rgba(212,175,55,0.2)]",
      iconColor: "text-temple-gold",
      borderColor: "group-hover:border-temple-gold/60"
    },
    {
      id: "whatsapp",
      icon: WhatsAppIcon,
      title: "WhatsApp",
      value: whatsapp,
      desc: locale === "ta" ? "செய்தி அனுப்ப" : "Send us a message",
      href: `https://wa.me/91${whatsapp.replace(/\D/g, '')}?text=${prefilledMessage}`,
      glowColor: "group-hover:shadow-[0_10px_40px_-10px_rgba(37,211,102,0.35),0_0_20px_-5px_rgba(37,211,102,0.2)]",
      iconColor: "text-green-500",
      borderColor: "group-hover:border-green-500/60"
    },
    {
      id: "email",
      icon: Mail,
      title: locale === "ta" ? "மின்னஞ்சல்" : "Email Us",
      value: email,
      desc: locale === "ta" ? "ஆன்லைன் தொடர்புக்கு" : "For online enquiries",
      href: `mailto:${email}`,
      glowColor: "group-hover:shadow-[0_10px_40px_-10px_rgba(212,175,55,0.4),0_0_20px_-5px_rgba(212,175,55,0.2)]",
      iconColor: "text-temple-gold",
      borderColor: "group-hover:border-temple-gold/60"
    },
    {
      id: "location",
      icon: MapPin,
      title: locale === "ta" ? "இடம்" : "Location",
      value: "Sri Sakthi Vinayagar",
      desc: locale === "ta" ? "வழிசெலுத்தலை பெற" : "Get Directions",
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressEn)}`,
      glowColor: "group-hover:shadow-[0_10px_40px_-10px_rgba(139,24,24,0.3),0_0_20px_-5px_rgba(139,24,24,0.15)]",
      iconColor: "text-primary",
      borderColor: "group-hover:border-primary/60"
    },
  ];

  if (instagram) {
    contactCards.push({
      id: "instagram",
      icon: InstagramIcon,
      title: "Instagram",
      value: "@sakthivinayagar",
      desc: locale === "ta" ? "எங்களை பின்தொடர" : "Follow our updates",
      href: instagram,
      glowColor: "group-hover:shadow-[0_10px_40px_-10px_rgba(225,48,108,0.35),0_0_20px_-5px_rgba(225,48,108,0.2)]",
      iconColor: "text-pink-600 dark:text-pink-500",
      borderColor: "group-hover:border-pink-500/60"
    });
  }

  return (
    <div className="w-full">
      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-16 lg:mb-24">
        {contactCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.a
              key={card.id}
              href={card.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                group relative bg-card p-6 rounded-[1.5rem] border border-border/50 shadow-sm 
                overflow-hidden transition-all duration-300 ease-out
                ${card.glowColor} ${card.borderColor}
                flex flex-col items-center text-center
              `}
            >
              {/* Premium background gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div className="relative z-10 w-12 h-12 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center mb-4 group-hover:bg-background group-hover:shadow-md transition-all duration-300">
                <Icon className={`w-5 h-5 ${card.iconColor} transition-transform duration-300 group-hover:scale-110`} />
              </div>

              <h4 className="relative z-10 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">{card.title}</h4>
              <p className="relative z-10 text-sm sm:text-base font-semibold text-foreground leading-tight mb-3 break-words w-full group-hover:text-primary transition-colors duration-300">
                {card.value}
              </p>

              <div className="relative z-10 mt-auto flex items-center justify-center gap-1.5 text-xs font-medium text-primary/70 group-hover:text-primary transition-colors">
                <span>{card.desc}</span>
                <ExternalLink className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </div>
            </motion.a>
          );
        })}
      </div>

      {/* MAP SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative max-w-5xl mx-auto w-full h-[400px] lg:h-[450px] rounded-[2rem] border border-primary/10 shadow-2xl overflow-hidden mb-16 lg:mb-24 group"
      >
        <iframe
          src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3892.428459461972!2d80.1706698!3d12.6853835!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a52542a17f69df1%3A0x6b823e200fb72477!2sSri%20Sakthi%20Vinayagar%20Temple!5e0!3m2!1sen!2sin!4v1716386400000!5m2!1sen!2sin`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000 ease-in-out"
        />

        {/* Floating Map Card */}
        <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 sm:right-auto sm:w-[340px] bg-card/95 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-primary/10 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-bold text-foreground">{locale === "ta" ? "ஸ்ரீ சக்தி விநாயகர் கோயில்" : "Sri Sakthi Vinayagar Temple"}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                {locale === "ta" ? addressTa : addressEn}
              </p>
            </div>
          </div>
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressEn)}`} target="_blank" rel="noopener noreferrer">
            <MotionButton variant="temple-primary" className="w-full text-xs font-semibold h-10">
              <Navigation className="w-3.5 h-3.5 mr-1.5" />
              {locale === "ta" ? "வழிசெலுத்தலை பெற" : "Get Directions"}
            </MotionButton>
          </a>
        </div>
      </motion.div>

      {/* FEEDBACK FORM SECTION */}
      <FeedbackForm messages={messages.feedback} />

      {/* CTA SECTION */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="max-w-3xl mx-auto text-center space-y-6 bg-primary/5 rounded-[2rem] p-8 sm:p-12 border border-primary/10"
      >
        <h3 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
          {locale === "ta" ? "ஏதேனும் கேள்விகள் உள்ளதா?" : "Have a question?"}
        </h3>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
          {locale === "ta"
            ? "கோயில் தகவல்கள், பூஜை நேரங்கள், திருவிழா நிகழ்ச்சிகள் அல்லது வேறு ஏதேனும் விவரங்களுக்கு எங்களை தொடர்பு கொள்ளவும்."
            : "Feel free to reach out to us for temple information, pooja timings, festival programs or other enquiries."}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <a href={`tel:${phone}`} className="w-full sm:w-auto">
            <MotionButton variant="temple-primary" className="w-full sm:w-auto h-12 px-8 rounded-xl shadow-md shadow-primary/20">
              <Phone className="w-4 h-4 mr-2" />
              {locale === "ta" ? "கோயிலை அழைக்க" : "Call Temple"}
            </MotionButton>
          </a>
          <a href={`https://wa.me/91${whatsapp.replace(/\D/g, '')}?text=${prefilledMessage}`} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
            <MotionButton variant="outline-temple" className="w-full sm:w-auto h-12 px-8 rounded-xl border-border bg-background">
              <WhatsAppIcon className="w-4 h-4 mr-2 text-green-500" />
              WhatsApp Us
            </MotionButton>
          </a>
        </div>
      </motion.div>
    </div>
  );
}
