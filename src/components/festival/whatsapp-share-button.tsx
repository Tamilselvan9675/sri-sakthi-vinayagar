"use client";

import { Button } from "@/components/ui/button";
import { Messages } from "@/i18n/get-messages";
import { MessageCircle } from "lucide-react";
import { Invitation } from "@/generated/prisma/client";
import { getLocalizedField } from "@/lib/utils/locale";

interface WhatsAppShareButtonProps {
  invitation: Invitation;
  locale: string;
  messages: Messages;
  className?: string;
}

export function WhatsAppShareButton({ invitation, locale, messages, className }: WhatsAppShareButtonProps) {
  const handleShare = () => {
    const templeName = messages.site.name;
    const title = getLocalizedField(invitation, "title", locale);
    const content = getLocalizedField(invitation, "content", locale) || "";
    
    // Construct the message based on locale
    let text = "";
    
    if (locale === "ta") {
      text = `🙏 விநாயகர் சதுர்த்தி அழைப்பிதழ் 🙏\n\n`;
      text += `*${templeName}*\n\n`;
      text += `${title}\n\n`;
      if (content) text += `${content}\n\n`;
      if (invitation.pdfUrl) text += `அழைப்பிதழை பதிவிறக்க: ${invitation.pdfUrl}\n\n`;
      text += `ஆன்லைன் அழைப்பிதழ்: ${window.location.href}`;
    } else {
      text = `🙏 Vinayagar Chaturthi Invitation 🙏\n\n`;
      text += `*${templeName}*\n\n`;
      text += `${title}\n\n`;
      if (content) text += `${content}\n\n`;
      if (invitation.pdfUrl) text += `Download Invitation: ${invitation.pdfUrl}\n\n`;
      text += `View Online: ${window.location.href}`;
    }

    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, "_blank", "noopener,noreferrer");
  };

  return (
    <Button 
      onClick={handleShare}
      className={`bg-[#25D366] hover:bg-[#128C7E] text-white ${className || ""}`}
    >
      <MessageCircle className="mr-2 h-5 w-5" />
      {messages.home.shareOnWhatsapp}
    </Button>
  );
}
