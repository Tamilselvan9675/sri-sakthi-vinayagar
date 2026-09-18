"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Users, Coins, Search, CheckCircle2, FileSpreadsheet, Calendar, HeartHandshake } from "lucide-react";
import { MotionButton } from "@/components/home/motion-button";
import { DONORS_2025 } from "./donor-data";
import { Input } from "@/components/ui/input";

interface DonorContentProps {
  locale: string;
}

export function DonorContent({ locale }: DonorContentProps) {
  const [selectedYear, setSelectedYear] = useState("2025");
  const [searchQuery, setSearchQuery] = useState("");
  const isTa = locale === "ta";
  
  const t = {
    title: isTa ? "நன்கொடையாளர் பட்டியல்" : "Temple Donor List",
    subtitle: isTa ? "கோவில் வளர்ச்சிக்கு உதவிய நல் உள்ளங்கள்" : "Generous hearts who supported the temple's growth and festivals.",
    downloadPdf: isTa ? "2025 வரவு செலவு அறிக்கை பதிவிறக்கம்" : "Download Original 2025 Budget",
    totalDonors: isTa ? "மொத்த நன்கொடையாளர்கள்" : "Total Contributors",
    totalAmount: isTa ? "மொத்த நன்கொடை" : "Total Amount Collected",
    name: isTa ? "நன்கொடையாளர் பெயர்" : "Donor Name",
    details: isTa ? "விவரங்கள் / முகவரி" : "Details / Address",
    amount: isTa ? "நன்கொடை (₹)" : "Amount (₹)",
    inKind: isTa ? "பொருள் பங்களிப்பு" : "In-Kind / Material",
    searchPlaceholder: isTa ? "பெயரைத் தேடுங்கள்..." : "Search by donor name...",
    noResults: isTa ? "எந்த நன்கொடையாளரும் காணப்படவில்லை." : "No donors found matching your search.",
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return t.inKind;
    return new Intl.NumberFormat(isTa ? 'en-IN' : 'en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const totalCollected = DONORS_2025.reduce((sum, donor) => sum + (donor.amount || 0), 0);
  const totalDonorCount = DONORS_2025.length;

  const filteredDonors = DONORS_2025.filter(donor => {
    const query = searchQuery.toLowerCase();
    const nameStr = isTa ? donor.donorNameTa : donor.donorNameEn;
    const detailStr = isTa ? donor.detailsTa : donor.detailsEn;
    return nameStr.toLowerCase().includes(query) || detailStr.toLowerCase().includes(query);
  });

  return (
    <div className="w-full">
      {/* HERO SECTION */}
      <section className="relative w-full py-20 lg:py-28 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10" />
        <div className="absolute inset-0 bg-[url('/images/temple-pattern.svg')] opacity-[0.03] dark:opacity-[0.05] bg-repeat" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-temple-gold/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm border border-primary/20 shadow-sm mb-6"
          >
            <Calendar className="w-4 h-4 text-temple-gold" />
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent border-none text-sm font-semibold text-foreground focus:ring-0 cursor-pointer outline-none"
            >
              <option value="2025">2025</option>
            </select>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6 drop-shadow-sm flex items-center justify-center gap-4"
          >
            <HeartHandshake className="w-10 h-10 md:w-14 md:h-14 text-temple-gold" />
            {t.title}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            {t.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          >
            <a href="/Sri_Sakthi_Vinayagar_Budget_2025.pdf" target="_blank" rel="noopener noreferrer">
              <MotionButton variant="premium-gold" className="h-14 px-8 text-base shadow-lg shadow-temple-gold/20">
                <FileSpreadsheet className="w-5 h-5 mr-2" />
                {t.downloadPdf}
              </MotionButton>
            </a>
          </motion.div>
        </div>
      </section>

      {/* SUMMARY SECTION */}
      <section className="container mx-auto px-4 md:px-6 -mt-10 relative z-20 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Total Donors */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-card/90 backdrop-blur-xl border border-primary/20 shadow-lg rounded-3xl p-8 flex items-center gap-6 group hover:-translate-y-1 hover:shadow-xl hover:border-primary/40 transition-all duration-300"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">{t.totalDonors}</p>
              <h3 className="text-4xl font-display font-bold text-foreground">{totalDonorCount}</h3>
            </div>
          </motion.div>

          {/* Total Amount */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-gradient-to-br from-temple-gold to-yellow-600 border border-temple-gold/30 shadow-lg rounded-3xl p-8 flex items-center gap-6 group hover:-translate-y-1 hover:shadow-[0_8px_40px_rgba(212,175,55,0.3)] transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('/images/temple-pattern.svg')] opacity-10 bg-repeat mix-blend-overlay" />
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform duration-300 relative z-10 backdrop-blur-md">
              <Coins className="w-8 h-8" />
            </div>
            <div className="relative z-10">
              <p className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-1">{t.totalAmount}</p>
              <h3 className="text-4xl font-display font-bold text-white">{formatCurrency(totalCollected)}</h3>
            </div>
          </motion.div>
        </div>
      </section>

      {/* DETAILED DONOR LIST */}
      <section className="container mx-auto px-4 md:px-6 pb-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-5xl mx-auto bg-card rounded-[2rem] border border-border/50 shadow-xl overflow-hidden"
        >
          {/* Table Header area */}
          <div className="bg-muted/40 p-6 md:p-8 border-b border-border/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input 
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 h-12 rounded-xl border-border/60 bg-background/50 focus-visible:ring-temple-gold text-base"
              />
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-temple-gold bg-temple-gold/10 px-4 py-2 rounded-full border border-temple-gold/20 shadow-sm whitespace-nowrap">
              <CheckCircle2 className="w-4 h-4" />
              {isTa ? "PDF உடன் சரிபார்க்கப்பட்டது" : "Verified with PDF"}
            </div>
          </div>

          {/* Donor Records Table */}
          <div className="p-0 sm:p-6 md:p-8 overflow-x-auto">
            <div className="min-w-[700px] w-full">
              <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <div className="col-span-1">#</div>
                <div className="col-span-4">{t.name}</div>
                <div className="col-span-5">{t.details}</div>
                <div className="col-span-2 text-right">{t.amount}</div>
              </div>
              
              <div className="divide-y divide-border/30">
                {filteredDonors.length > 0 ? (
                  filteredDonors.map((donor, idx) => (
                    <motion.div 
                      key={donor.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ delay: (idx % 10) * 0.05, duration: 0.4 }}
                      className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-muted/30 transition-colors group items-center"
                    >
                      <div className="col-span-1 text-sm font-medium text-muted-foreground">
                        {donor.id}
                      </div>
                      <div className="col-span-4 font-semibold text-foreground">
                        {isTa ? donor.donorNameTa : donor.donorNameEn}
                      </div>
                      <div className="col-span-5 text-sm text-muted-foreground whitespace-pre-wrap">
                        {isTa ? donor.detailsTa : donor.detailsEn}
                      </div>
                      <div className="col-span-2 text-right font-display font-semibold text-foreground flex items-center justify-end">
                        {donor.amount === null ? (
                          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20">
                            {t.inKind}
                          </span>
                        ) : (
                          formatCurrency(donor.amount)
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-12 text-center text-muted-foreground flex flex-col items-center">
                    <Search className="w-10 h-10 mb-3 opacity-20" />
                    <p>{t.noResults}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
