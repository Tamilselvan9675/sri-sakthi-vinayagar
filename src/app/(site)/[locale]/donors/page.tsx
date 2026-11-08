import { DonorContent } from "./donor-content";
import { getCmsFinance } from "@/lib/cms/content";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  
  return {
    title: locale === "ta" ? "நன்கொடையாளர்கள்" : "Donors",
  };
}

export default async function DonorsPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const finance = await getCmsFinance();

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <DonorContent
        locale={locale}
        donors={finance?.donors}
        year={finance?.year}
        years={finance?.years}
      />
    </main>
  );
}
