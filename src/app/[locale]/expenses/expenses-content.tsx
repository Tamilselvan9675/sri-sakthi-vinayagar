"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, animate } from "motion/react";
import { TrendingDown, TrendingUp, Wallet, FileSpreadsheet, Calendar, FileText, CheckCircle2, HeartHandshake, Search } from "lucide-react";

import { EXPENSES_2025 } from "./expense-data";
import { DONORS_2025 } from "./donor-data";
import { Input } from "@/components/ui/input";

interface ExpensesContentProps {
  locale: string;
}

function Counter({ value, isCurrency = true, isTa = false }: { value: number; isCurrency?: boolean; isTa?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView && ref.current) {
      animate(0, value, {
        duration: 2.5,
        ease: [0.16, 1, 0.3, 1], // Exaggerated easeOut for a very smooth slow finish
        onUpdate: (latest) => {
          if (ref.current) {
            if (isCurrency) {
              ref.current.textContent = new Intl.NumberFormat(isTa ? 'en-IN' : 'en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(Math.round(latest));
            } else {
              ref.current.textContent = Math.round(latest).toString();
            }
          }
        },
      });
    }
  }, [isInView, value, isCurrency, isTa]);

  return <span ref={ref} className="tabular-nums font-sans tracking-tight">0</span>;
}

export function ExpensesContent({ locale }: ExpensesContentProps) {
  const [selectedYear, setSelectedYear] = useState("2025");
  const [donorSearchQuery, setDonorSearchQuery] = useState("");
  const [expenseSearchQuery, setExpenseSearchQuery] = useState("");
  const isTa = locale === "ta";

  // Force scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const t = {
    title: isTa ? "கோவில் நிதி அறிக்கை" : "Temple Financial Report",
    subtitle: isTa ? "எங்கள் சமூகத்திற்கு வெளிப்படையான நிதி அறிக்கைகள்" : "Clear and transparent financial reports for our community",
    downloadPdf: isTa ? "2025 வரவு செலவு அறிக்கை பதிவிறக்கம்" : "Download Original 2025 Budget",
    income: isTa ? "மொத்த வருமானம்" : "Total Income",
    expense: isTa ? "மொத்த செலவுகள்" : "Total Expenses",
    balance: isTa ? "மீதமுள்ள இருப்பு" : "Remaining Balance",
    category: isTa ? "பிரிவு" : "Category",
    details: isTa ? "விவரங்கள்" : "Description",
    street: isTa ? "தெரு / இடம்" : "Street / Location",
    amount: isTa ? "தொகை (₹)" : "Amount (₹)",
    inKind: isTa ? "பொருள் பங்களிப்பு" : "In-Kind / Material",
    responsible: isTa ? "பொறுப்பாளர்" : "Responsible Person",
    donorName: isTa ? "நன்கொடையாளர் பெயர்" : "Donor Name",
    searchDonor: isTa ? "நன்கொடையாளரைத் தேடுங்கள்..." : "Search donors...",
    searchExpense: isTa ? "செலவைத் தேடுங்கள்..." : "Search expenses...",
    noResults: isTa ? "எந்த முடிவும் காணப்படவில்லை." : "No results found matching your search.",
    lastUpdated: isTa ? "கடைசியாக புதுப்பிக்கப்பட்டது: 18 செப்டம்பர் 2026" : "Last updated: 18 September 2026",
    verified: isTa ? "2025 பட்ஜெட் PDF உடன் சரிபார்க்கப்பட்டது" : "Verified with 2025 Budget PDF",
    totalDonation: isTa ? "மொத்த நன்கொடை" : "TOTAL DONATION",
    totalExpense: isTa ? "மொத்த செலவு" : "TOTAL EXPENSE",
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return t.inKind;
    return new Intl.NumberFormat(isTa ? 'en-IN' : 'en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const filteredDonors = DONORS_2025.filter(donor => {
    const query = donorSearchQuery.toLowerCase();
    const nameStr = isTa ? donor.donorNameTa : donor.donorNameEn;
    const detailStr = isTa ? donor.detailsTa : donor.detailsEn;
    return nameStr.toLowerCase().includes(query) || detailStr.toLowerCase().includes(query);
  });

  const filteredExpenses = EXPENSES_2025.filter(expense => {
    const query = expenseSearchQuery.toLowerCase();
    const catStr = isTa ? expense.categoryTa : expense.categoryEn;
    const detailStr = isTa ? expense.detailsTa : expense.detailsEn;
    const respStr = isTa ? expense.responsibleTa : expense.responsibleEn;
    return catStr.toLowerCase().includes(query) || detailStr.toLowerCase().includes(query) || respStr.toLowerCase().includes(query);
  });

  const totalDonationAmount = 193463;
  const totalExpenseAmount = 148941;
  const balanceAmount = 52922;

  const splitDetails = (details: string) => {
    const parts = details.split(' - ');
    if (parts.length > 1) {
      return {
        street: parts[0],
        desc: parts.slice(1).join(' - ')
      };
    }
    return {
      street: details,
      desc: "-"
    };
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-background via-[#fdfbf7] to-background dark:from-background dark:via-[oklch(0.18_0.02_22)] dark:to-background">
      {/* HERO SECTION */}
      <section className="relative w-full py-20 lg:py-28 flex items-center justify-center overflow-hidden">
        {/* Deep premium radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-temple-gold/10 via-red-900/5 to-transparent blur-[80px] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/images/temple-pattern.svg')] opacity-[0.03] dark:opacity-[0.05] bg-repeat pointer-events-none" />

        <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/60 dark:bg-black/40 backdrop-blur-md border border-temple-gold/20 shadow-sm mb-8"
          >
            <Calendar className="w-4 h-4 text-temple-gold" />
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent border-none text-sm font-semibold text-foreground focus:ring-0 cursor-pointer outline-none"
            >
              <option value="2025">2025 Financial Year</option>
            </select>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6 drop-shadow-sm"
          >
            {t.title}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12"
          >
            {t.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          >
            <a href="/Sri_Sakthi_Vinayagar_Budget_2025.pdf" target="_blank" rel="noopener noreferrer">
              <button className="relative group overflow-hidden rounded-full px-8 py-4 bg-gradient-to-r from-red-900 to-red-950 border border-temple-gold/30 shadow-[0_0_40px_-10px_rgba(212,175,55,0.4)] hover:shadow-[0_0_60px_-15px_rgba(212,175,55,0.6)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300">
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-temple-gold/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <span className="relative flex items-center justify-center text-white font-medium">
                  <FileSpreadsheet className="w-5 h-5 mr-2 text-temple-gold group-hover:text-white transition-colors" />
                  {t.downloadPdf}
                </span>
              </button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* FINANCIAL SUMMARY */}
      <section className="container mx-auto px-4 md:px-6 -mt-10 relative z-20 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Income */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="bg-white/80 dark:bg-card/80 backdrop-blur-2xl border border-green-500/20 shadow-xl shadow-green-900/5 rounded-[2rem] p-8 flex flex-col items-center text-center group hover:shadow-2xl hover:shadow-green-900/10 hover:-translate-y-1 hover:border-green-500/30 transition-all duration-300"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-600/5 flex items-center justify-center text-green-600 dark:text-green-400 mb-5 group-hover:scale-110 group-hover:bg-green-500/20 transition-all duration-300">
              <TrendingUp className="w-7 h-7" />
            </div>
            <p className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-widest mb-2 font-display">{t.income}</p>
            <h3 className="text-3xl lg:text-4xl font-display font-bold text-foreground">
              <Counter value={totalDonationAmount} isTa={isTa} />
            </h3>
          </motion.div>

          {/* Expenses */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-white/80 dark:bg-card/80 backdrop-blur-2xl border border-red-500/20 shadow-xl shadow-red-900/5 rounded-[2rem] p-8 flex flex-col items-center text-center group hover:shadow-2xl hover:shadow-red-900/10 hover:-translate-y-1 hover:border-red-500/30 transition-all duration-300"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-600/5 flex items-center justify-center text-red-600 dark:text-red-400 mb-5 group-hover:scale-110 group-hover:bg-red-500/20 transition-all duration-300">
              <TrendingDown className="w-7 h-7" />
            </div>
            <p className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-widest mb-2 font-display">{t.expense}</p>
            <h3 className="text-3xl lg:text-4xl font-display font-bold text-foreground">
              <Counter value={totalExpenseAmount} isTa={isTa} />
            </h3>
          </motion.div>

          {/* Balance */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-gradient-to-br from-red-950 via-red-900 to-primary border border-temple-gold/30 shadow-2xl shadow-red-900/20 rounded-[2rem] p-8 flex flex-col items-center text-center group hover:shadow-red-900/40 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('/images/temple-pattern.svg')] opacity-[0.15] bg-repeat mix-blend-overlay" />
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-temple-gold/20 blur-2xl rounded-full group-hover:scale-150 transition-transform duration-700" />
            
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-temple-gold mb-5 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300 relative z-10 backdrop-blur-md">
              <Wallet className="w-7 h-7" />
            </div>
            <p className="text-xs font-bold text-temple-gold uppercase tracking-widest mb-2 font-display relative z-10">{t.balance}</p>
            <h3 className="text-3xl lg:text-4xl font-display font-bold text-white relative z-10">
              <Counter value={balanceAmount} isTa={isTa} />
            </h3>
          </motion.div>
        </div>
      </section>

      {/* DETAILED DONOR LIST SECTION */}
      <section className="container mx-auto px-4 md:px-6 pb-20">
        <div className="max-w-6xl mx-auto mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.lastUpdated}</span>
            <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20 shadow-[0_0_15px_-3px_rgba(34,197,94,0.2)]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t.verified}
            </div>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-6xl mx-auto bg-white/70 dark:bg-card/60 backdrop-blur-xl rounded-[2rem] border border-border shadow-2xl overflow-hidden"
        >
          {/* Table Header area */}
          <div className="p-6 md:p-8 border-b border-border/50 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-muted/20">
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground flex items-center gap-3">
                <HeartHandshake className="w-8 h-8 text-green-600 dark:text-green-500" />
                {isTa ? "நன்கொடையாளர் பட்டியல்" : "Temple Donor List"}
              </h2>
            </div>
            <div className="w-full lg:w-80 relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/30 to-temple-gold/30 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  type="text"
                  placeholder={t.searchDonor}
                  value={donorSearchQuery}
                  onChange={(e) => setDonorSearchQuery(e.target.value)}
                  className="w-full pl-10 h-11 rounded-xl border-border/60 bg-white/80 dark:bg-black/50 focus-visible:ring-1 focus-visible:ring-green-500/50 text-sm transition-all"
                />
              </div>
            </div>
          </div>

          {/* Donor Records Table */}
          <div className="relative overflow-x-auto h-[600px] overflow-y-auto w-full styled-scrollbar">
            <div className="min-w-[800px] w-full">
              {/* Sticky Header */}
              <div className="grid grid-cols-12 gap-4 px-6 md:px-8 py-4 border-b border-border/50 text-[11px] font-bold text-foreground uppercase tracking-widest sticky top-0 z-30 bg-white/95 dark:bg-[#1a1515]/95 backdrop-blur-md shadow-sm">
                <div className="col-span-1">#</div>
                <div className="col-span-3">{t.donorName}</div>
                <div className="col-span-3">{t.street}</div>
                <div className="col-span-3">{t.details}</div>
                <div className="col-span-2 text-right">{t.amount}</div>
              </div>
              
              <div className="divide-y divide-border/40">
                {filteredDonors.length > 0 ? (
                  filteredDonors.map((donor) => {
                    const parsedDetails = splitDetails(isTa ? donor.detailsTa : donor.detailsEn);
                    return (
                      <div 
                        key={donor.id}
                        className="grid grid-cols-12 gap-4 px-6 md:px-8 py-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group items-center"
                      >
                        <div className="col-span-1 text-[11px] font-medium text-muted-foreground">
                          {String(donor.id).padStart(2, '0')}
                        </div>
                        <div className="col-span-3 text-[13px] font-semibold text-foreground/90 leading-snug">
                          {isTa ? donor.donorNameTa : donor.donorNameEn}
                        </div>
                        <div className="col-span-3 text-[12px] text-muted-foreground whitespace-pre-wrap leading-relaxed">
                          {parsedDetails.street}
                        </div>
                        <div className="col-span-3 text-[12px] text-muted-foreground whitespace-pre-wrap leading-relaxed">
                          {parsedDetails.desc}
                        </div>
                        <div className="col-span-2 text-right text-[13px] tabular-nums font-sans font-semibold text-foreground flex items-center justify-end">
                          {donor.amount === null ? (
                            <span className="inline-block px-2.5 py-0.5 bg-green-500/10 text-green-700 dark:text-green-400 text-[10px] uppercase tracking-wider font-bold rounded-full border border-green-500/20">
                              {t.inKind}
                            </span>
                          ) : (
                            formatCurrency(donor.amount)
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-16 text-center text-muted-foreground flex flex-col items-center">
                    <Search className="w-12 h-12 mb-4 opacity-20" />
                    <p>{t.noResults}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* DONOR TOTAL FOOTER */}
          <div className="border-t border-green-500/30 bg-gradient-to-r from-green-500/10 via-green-500/20 to-green-600/5 p-6 md:p-8 flex justify-between items-center relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('/images/temple-pattern.svg')] opacity-[0.05] bg-repeat mix-blend-overlay" />
             <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-green-500/20 via-green-400/5 to-transparent" />
             <span className="text-sm font-bold text-green-700 dark:text-green-400 tracking-widest relative z-10">{t.totalDonation}</span>
             <span className="text-3xl tabular-nums font-sans font-bold text-foreground z-10">{formatCurrency(totalDonationAmount)}</span>
          </div>
        </motion.div>
      </section>

      {/* DETAILED EXPENSE LIST SECTION */}
      <section className="container mx-auto px-4 md:px-6 pb-32">
        <div className="max-w-6xl mx-auto mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.lastUpdated}</span>
            <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20 shadow-[0_0_15px_-3px_rgba(34,197,94,0.2)]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t.verified}
            </div>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-6xl mx-auto bg-white/70 dark:bg-card/60 backdrop-blur-xl rounded-[2rem] border border-border shadow-2xl overflow-hidden"
        >
          {/* Table Header area */}
          <div className="p-6 md:p-8 border-b border-border/50 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-muted/20">
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground flex items-center gap-3">
                <FileText className="w-8 h-8 text-red-600 dark:text-red-500" />
                {isTa ? "முழுமையான செலவுப் பட்டியல்" : "Complete Expense List"}
              </h2>
            </div>
            <div className="w-full lg:w-80 relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/30 to-temple-gold/30 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  type="text"
                  placeholder={t.searchExpense}
                  value={expenseSearchQuery}
                  onChange={(e) => setExpenseSearchQuery(e.target.value)}
                  className="w-full pl-10 h-11 rounded-xl border-border/60 bg-white/80 dark:bg-black/50 focus-visible:ring-1 focus-visible:ring-red-500/50 text-sm transition-all"
                />
              </div>
            </div>
          </div>

          {/* Expense Records Table */}
          <div className="relative overflow-x-auto h-[600px] overflow-y-auto w-full styled-scrollbar">
            <div className="min-w-[900px] w-full">
              {/* Sticky Header */}
              <div className="grid grid-cols-12 gap-4 px-6 md:px-8 py-4 border-b border-border/50 text-[11px] font-bold text-foreground uppercase tracking-widest sticky top-0 z-30 bg-white/95 dark:bg-[#1a1515]/95 backdrop-blur-md shadow-sm">
                <div className="col-span-3">{t.category}</div>
                <div className="col-span-5">{t.details}</div>
                <div className="col-span-2">{t.responsible}</div>
                <div className="col-span-2 text-right">{t.amount}</div>
              </div>
              
              <div className="divide-y divide-border/40">
                {filteredExpenses.length > 0 ? (
                  filteredExpenses.map((expense) => (
                    <div 
                      key={expense.id}
                      className="grid grid-cols-12 gap-4 px-6 md:px-8 py-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group items-start"
                    >
                      <div className="col-span-3 text-[13px] font-semibold text-foreground/90 pt-0.5 leading-snug">
                        {isTa ? expense.categoryTa : expense.categoryEn}
                      </div>
                      <div className="col-span-5 text-[12px] text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {isTa ? expense.detailsTa : expense.detailsEn}
                      </div>
                      <div className="col-span-2 text-[12px] text-foreground/70 pt-0.5">
                        {isTa ? expense.responsibleTa : expense.responsibleEn}
                      </div>
                      <div className="col-span-2 text-[13px] text-right tabular-nums font-sans font-semibold text-foreground flex items-center justify-end pt-0.5">
                        {expense.amount === null ? (
                          <span className="inline-block px-2.5 py-0.5 bg-red-500/10 text-red-700 dark:text-red-400 text-[10px] uppercase tracking-wider font-bold rounded-full border border-red-500/20">
                            {t.inKind}
                          </span>
                        ) : (
                          formatCurrency(expense.amount)
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-16 text-center text-muted-foreground flex flex-col items-center">
                    <Search className="w-12 h-12 mb-4 opacity-20" />
                    <p>{t.noResults}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* EXPENSE TOTAL FOOTER */}
          <div className="border-t border-red-500/30 bg-gradient-to-r from-red-500/10 via-red-500/20 to-red-600/5 p-6 md:p-8 flex justify-between items-center relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('/images/temple-pattern.svg')] opacity-[0.05] bg-repeat mix-blend-overlay" />
             <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-500/20 via-red-400/5 to-transparent" />
             <span className="text-sm font-bold text-red-700 dark:text-red-400 tracking-widest relative z-10">{t.totalExpense}</span>
             <span className="text-3xl tabular-nums font-sans font-bold text-foreground z-10">{formatCurrency(totalExpenseAmount)}</span>
          </div>
        </motion.div>
      </section>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .styled-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .styled-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .styled-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(212,175,55,0.2);
          border-radius: 20px;
        }
        .styled-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: rgba(212,175,55,0.4);
        }
      `}} />
    </div>
  );
}
