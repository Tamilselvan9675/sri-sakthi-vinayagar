"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, CheckCircle2, User, Mail, Phone as PhoneIcon, MessageSquare, Star } from "lucide-react";
import { MotionButton } from "@/components/home/motion-button";

interface FeedbackFormProps {
  messages: Record<string, string>;
}

export function FeedbackForm({ messages: t }: FeedbackFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Star rating state
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate a network request for a premium feel
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Reset after 5 seconds
      setTimeout(() => {
        setIsSuccess(false);
        setRating(0);
        (e.target as HTMLFormElement).reset();
      }, 5000);
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="w-full max-w-4xl mx-auto mb-16 lg:mb-24 bg-card rounded-[2rem] border border-primary/10 shadow-xl overflow-hidden relative"
    >
      {/* Decorative side accent */}
      <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary via-temple-gold to-primary/50" />

      <div className="p-8 sm:p-12 relative">
        <div className="text-center mb-10">
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-3">
            {t.title}
          </h3>
          <p className="text-muted-foreground">
            {t.subtitle}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center text-center py-12"
            >
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h4 className="text-2xl font-bold text-foreground mb-3">{t.successTitle}</h4>
              <p className="text-muted-foreground max-w-md">{t.successMsg}</p>
            </motion.div>
          ) : (
            <motion.form 
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Name */}
                <div className="space-y-3 group relative">
                  <label htmlFor="name" className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <User className="w-4 h-4 text-primary/70" />
                    {t.name} <span className="text-destructive">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="name" 
                    required
                    minLength={3}
                    placeholder={t.namePlaceholder}
                    className="w-full bg-muted/20 border-b-2 border-transparent rounded-t-xl px-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:bg-primary/5 transition-all group-hover:bg-muted/40 shadow-inner"
                  />
                </div>

                {/* Email */}
                <div className="space-y-3 group relative">
                  <label htmlFor="email" className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary/70" />
                    {t.email} <span className="text-destructive">*</span>
                  </label>
                  <input 
                    type="email" 
                    id="email" 
                    required
                    placeholder={t.emailPlaceholder}
                    className="w-full bg-muted/20 border-b-2 border-transparent rounded-t-xl px-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:bg-primary/5 transition-all group-hover:bg-muted/40 shadow-inner"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-3 group relative">
                <label htmlFor="phone" className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4 text-primary/70" />
                  {t.phone} <span className="text-destructive">*</span>
                </label>
                <input 
                  type="tel" 
                  id="phone" 
                  required
                  pattern="[0-9]{10}"
                  title="Please enter exactly 10 digits"
                  placeholder={t.phonePlaceholder}
                  className="w-full bg-muted/20 border-b-2 border-transparent rounded-t-xl px-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:bg-primary/5 transition-all group-hover:bg-muted/40 shadow-inner"
                />
              </div>
              
              {/* Star Rating */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary/70" />
                  {t.rating}
                </label>
                <div className="flex items-center gap-2" onMouseLeave={() => setHoverRating(0)}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (hoverRating || rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        className="relative p-1 focus:outline-none transition-transform duration-200 hover:scale-110 active:scale-95"
                      >
                        <Star 
                          className={`w-8 h-8 transition-colors duration-300 ${isFilled ? "text-temple-gold fill-temple-gold drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]" : "text-muted-foreground/30"}`} 
                          strokeWidth={isFilled ? 1 : 1.5}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message */}
              <div className="space-y-3 group relative">
                <label htmlFor="message" className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary/70" />
                  {t.message} <span className="text-destructive">*</span>
                </label>
                <textarea 
                  id="message" 
                  required
                  minLength={10}
                  rows={4}
                  placeholder={t.messagePlaceholder}
                  className="w-full bg-muted/20 border-b-2 border-transparent rounded-t-xl px-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:bg-primary/5 transition-all resize-none group-hover:bg-muted/40 shadow-inner"
                />
              </div>

              {/* Submit */}
              <div className="pt-6">
                <MotionButton 
                  type="submit" 
                  variant="temple-primary" 
                  disabled={isSubmitting}
                  className={`w-full sm:w-auto min-w-[200px] h-14 rounded-xl shadow-lg shadow-primary/20 transition-all ${isSubmitting ? 'opacity-90' : 'hover:shadow-primary/40 hover:shadow-[0_0_20px_rgba(139,24,24,0.3)]'}`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t.sending}
                    </span>
                  ) : (
                    <span className="flex items-center text-base">
                      {t.submit}
                      <Send className="w-4 h-4 ml-2" />
                    </span>
                  )}
                </MotionButton>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
