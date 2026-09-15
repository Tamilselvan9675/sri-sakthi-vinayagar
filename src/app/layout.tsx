import type { Metadata } from "next";
import { Inter, Playfair_Display, Noto_Sans_Tamil } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import "./globals.css";

/* ========================================================================
   Typography System
   - Display (headings):  Playfair Display — elegant serif
   - Body (UI/text):      Inter — highly readable sans-serif
   - Tamil:               Noto Sans Tamil — best Tamil web font
   ======================================================================== */

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const notoSansTamil = Noto_Sans_Tamil({
  variable: "--font-noto-sans-tamil",
  subsets: ["latin", "tamil"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Sri Sakthi Vinayagar Temple",
    template: "%s | Sri Sakthi Vinayagar Temple",
  },
  description:
    "Official website of Sri Sakthi Vinayagar Temple — festivals, poojas, events, gallery, and community services.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${playfairDisplay.variable} ${notoSansTamil.variable} h-full`}
    >
      <body className="flex min-h-full flex-col font-sans antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
