"use client";
import { GlassSelect } from "@/components/ui/glass-select";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Users, Coins, Search, CheckCircle2, FileSpreadsheet, Calendar, HeartHandshake, ChevronDown, ZoomIn, ZoomOut } from "lucide-react";
import { MotionButton } from "@/components/home/motion-button";
import type { CmsDonorRow as DonorRecord, CmsFinanceYear } from "@/lib/cms/content";
import { Input } from "@/components/ui/input";

interface DonorContentProps {
  locale: string;
  donors?: DonorRecord[];
  year?: number;
  years?: CmsFinanceYear[];
}

export function DonorContent({ locale, donors, year, years }: DonorContentProps) {
  const yearlyRecords: CmsFinanceYear[] =
    years && years.length > 0
      ? years
      : donors && year
        ? [
            {
              year,
              donors,
              expenses: [],
              totalIncome: donors.reduce((sum, d) => sum + (d.amount || 0), 0),
              totalExpense: 0,
              balance: 0,
              pdfUrl: "#",
            },
          ]
        : [];

  const yearLabel = yearlyRecords[0] ? String(yearlyRecords[0].year) : "";
  const [selectedYear, setSelectedYear] = useState(yearLabel);
  const [searchQuery, setSearchQuery] = useState("");
  const [donorZoom, setDonorZoom] = useState(1);
  const MIN_ZOOM = 0.2;
  const MAX_ZOOM = 1.5;
  const ZOOM_STEP = 0.1;
  const isTa = locale === "ta";

  const activeRecord =
    yearlyRecords.find((r) => String(r.year) === selectedYear) ?? yearlyRecords[0];
  const records = activeRecord?.donors ?? [];
  const activeYearLabel = activeRecord ? String(activeRecord.year) : "";
  const hasRecords = yearlyRecords.length > 0;
  const hasDownloadUrl = Boolean(activeRecord?.pdfUrl && activeRecord.pdfUrl !== "#");

  useEffect(() => {
    if (yearlyRecords.length > 0 && !yearlyRecords.some((r) => String(r.year) === selectedYear)) {
      setSelectedYear(String(yearlyRecords[0].year));
    } else if (yearlyRecords.length === 0 && selectedYear !== "") {
      setSelectedYear("");
    }
  }, [yearlyRecords, selectedYear]);
  
  const t = {
    title: isTa ? "நன்கொடையாளர் பட்டியல்" : "Temple Donor List",
    subtitle: isTa ? "கோவில் வளர்ச்சிக்கு உதவிய நல் உள்ளங்கள்" : "Generous hearts who supported the temple's growth and festivals.",
    noYearOption: isTa ? "நிதி அறிக்கை இல்லை" : "No Financial Year",
    downloadPdf: activeYearLabel
      ? isTa
        ? `${activeYearLabel} வரவு செலவு அறிக்கை பதிவிறக்கம்`
        : `Download Original ${activeYearLabel} Budget`
      : isTa
        ? "வரவு செலவு அறிக்கை பதிவிறக்கம்"
        : "Download Original Budget",
    totalDonors: isTa ? "மொத்த நன்கொடையாளர்கள்" : "Total Contributors",
    totalAmount: isTa ? "மொத்த நன்கொடை" : "Total Amount Collected",
    name: isTa ? "நன்கொடையாளர் பெயர்" : "Donor Name",
    details: isTa ? "விவரங்கள் / முகவரி" : "Details / Address",
    amount: isTa ? "நன்கொடை (₹)" : "Amount (₹)",
    inKind: isTa ? "பொருள் பங்களிப்பு" : "In-Kind / Material",
    searchPlaceholder: isTa ? "பெயரைத் தேடுங்கள்..." : "Search by donor name...",
    noResults: isTa ? "எந்த நன்கொடையாளரும் காணப்படவில்லை." : "No donors found matching your search.",
    noDonorsTitle: isTa ? "நன்கொடையாளர் விவரங்கள் இன்னும் பதிவேற்றப்படவில்லை" : "No donor records available yet",
    noDonorsSubtitle: isTa
      ? "நிதி அறிக்கை பதிவேற்றப்பட்டதும் நன்கொடையாளர் விவரங்கள் இங்கு காண்பிக்கப்படும்."
      : "Donor details will appear here once a financial report is uploaded.",
    zoomIn: isTa ? "பெரிதாக்கு" : "Zoom in",
    zoomOut: isTa ? "சிறிதாக்கு" : "Zoom out",
    zoomReset: isTa ? "இயல்பு அளவு (100%)" : "Reset zoom to 100%",
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return t.inKind;
    return new Intl.NumberFormat(isTa ? 'en-IN' : 'en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const totalCollected = records.reduce((sum, donor) => sum + (donor.amount || 0), 0);
  const totalDonorCount = records.length;

  const filteredDonors = records.filter(donor => {
    const query = searchQuery.toLowerCase();
    const nameStr = isTa ? donor.donorNameTa : donor.donorNameEn;
    const detailStr = isTa ? donor.detailsTa : donor.detailsEn;
    return nameStr.toLowerCase().includes(query) || detailStr.toLowerCase().includes(query);
  });

  const renderDetails = (text: string) => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return "-";
    return (
      <div className="space-y-1">
        {lines.map((line, i) => {
          if (/^-{3,}/.test(line)) {
            return <div key={i} className="my-2 border-t border-border/60" />;
          }
          const bulletMatch = line.match(/^(?:•|👉|☞|👈|👆|👇)\s*(.*)$/);
          if (bulletMatch) {
            return (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-[0.58em] h-[0.5em] w-[0.5em] rounded-full bg-temple-gold shrink-0" />
                <span>{bulletMatch[1]}</span>
              </div>
            );
          }
          return <div key={i}>{line}</div>;
        })}
      </div>
    );
  };

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
            className="inline-block mb-6"
          >
            <GlassSelect 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              disabled={!hasRecords}
              startIcon={<Calendar className="w-4 h-4 text-temple-gold shrink-0" />}
              endIcon={<ChevronDown className="w-4 h-4 text-temple-gold shrink-0" />}
              className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-background/80 dark:bg-card/80 backdrop-blur-md border border-temple-gold/20 shadow-sm text-sm font-semibold text-foreground hover:border-temple-gold/40 focus:outline-none focus:ring-2 focus:ring-temple-gold/40 transition-all ${hasRecords ? "cursor-pointer" : "cursor-default opacity-80"}`}
            >
              {hasRecords ? (
                yearlyRecords.map((r) => (
                  <option key={r.year} value={String(r.year)}>
                    {r.year} Financial Year
                  </option>
                ))
              ) : (
                <option value="">{t.noYearOption}</option>
              )}
            </GlassSelect>
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
            {hasDownloadUrl ? (
              <a href={activeRecord!.pdfUrl} target="_blank" rel="noopener noreferrer">
                <MotionButton variant="premium-gold" className="h-auto min-h-14 max-w-full px-6 sm:px-8 py-3 text-sm sm:text-base whitespace-normal text-left shadow-lg shadow-temple-gold/20">
                  <FileSpreadsheet className="w-5 h-5 shrink-0" />
                  {t.downloadPdf}
                </MotionButton>
              </a>
            ) : (
              <MotionButton
                variant="premium-gold"
                disabled
                className="h-auto min-h-14 max-w-full px-6 sm:px-8 py-3 text-sm sm:text-base whitespace-normal text-left shadow-lg shadow-temple-gold/20 opacity-60 cursor-not-allowed"
              >
                <FileSpreadsheet className="w-5 h-5 shrink-0" />
                {t.downloadPdf}
              </MotionButton>
            )}
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
            <div className="flex flex-wrap items-center gap-3">
              <div
                role="group"
                aria-label={isTa ? "நன்கொடையாளர் பட்டியல் அளவு கட்டுப்பாடு" : "Donor list zoom controls"}
                className="inline-flex items-center rounded-xl border border-border/60 bg-background/60 p-1 shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setDonorZoom((z) => Math.max(MIN_ZOOM, Number((z - ZOOM_STEP).toFixed(2))))}
                  disabled={donorZoom <= MIN_ZOOM}
                  aria-label={t.zoomOut}
                  title={t.zoomOut}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-temple-gold/10 hover:text-temple-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-temple-gold/50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDonorZoom(1)}
                  aria-label={t.zoomReset}
                  title={t.zoomReset}
                  className="px-2.5 h-9 text-xs font-semibold tabular-nums text-foreground/80 hover:text-foreground rounded-lg hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-temple-gold/50 transition-colors min-w-[3.25rem]"
                >
                  {Math.round(donorZoom * 100)}%
                </button>
                <button
                  type="button"
                  onClick={() => setDonorZoom((z) => Math.min(MAX_ZOOM, Number((z + ZOOM_STEP).toFixed(2))))}
                  disabled={donorZoom >= MAX_ZOOM}
                  aria-label={t.zoomIn}
                  title={t.zoomIn}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-temple-gold/10 hover:text-temple-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-temple-gold/50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-temple-gold bg-temple-gold/10 px-4 py-2 rounded-full border border-temple-gold/20 shadow-sm whitespace-nowrap">
                <CheckCircle2 className="w-4 h-4" />
                {isTa ? "PDF உடன் சரிபார்க்கப்பட்டது" : "Verified with PDF"}
              </div>
            </div>
          </div>

          {/* Donor Records Table */}
          <div className="p-0 sm:p-6 md:p-8 overflow-x-auto">
            <div
              className="w-full transition-[font-size,min-width] duration-200 ease-out"
              style={{
                fontSize: `${donorZoom * 16}px`,
                minWidth: `${Math.round(700 * donorZoom)}px`,
              }}
            >
              <div className="grid grid-cols-12 gap-4 px-6 py-[1em] border-b border-border/50 text-[0.75em] font-semibold text-muted-foreground uppercase tracking-wider">
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
                      className="grid grid-cols-12 gap-4 px-6 py-[1em] hover:bg-muted/30 transition-colors group items-center"
                    >
                      <div className="col-span-1 text-[0.875em] font-medium text-muted-foreground">
                        {donor.id}
                      </div>
                      <div className="col-span-4 text-[1em] font-semibold text-foreground">
                        {isTa ? donor.donorNameTa : donor.donorNameEn}
                      </div>
                      <div className="col-span-5 text-[0.875em] text-muted-foreground leading-relaxed">
                        {renderDetails(isTa ? donor.detailsTa : donor.detailsEn)}
                      </div>
                      <div className="col-span-2 text-right text-[1em] font-display font-semibold text-foreground flex items-center justify-end">
                        {donor.amount === null ? (
                          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-[0.75em] rounded-full border border-primary/20">
                            {t.inKind}
                          </span>
                        ) : (
                          formatCurrency(donor.amount)
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : records.length === 0 ? (
                  <div className="py-16 px-6 text-center text-muted-foreground flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-temple-gold/10 border border-temple-gold/20 flex items-center justify-center text-temple-gold mb-4">
                      <HeartHandshake className="w-8 h-8" />
                    </div>
                    <p className="text-base font-semibold text-foreground mb-1">{t.noDonorsTitle}</p>
                    <p className="text-sm text-muted-foreground max-w-md">{t.noDonorsSubtitle}</p>
                  </div>
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
