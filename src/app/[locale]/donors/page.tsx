import { DonorContent } from "./donor-content";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  
  return {
    title: locale === "ta" ? "நன்கொடையாளர்கள்" : "Donors",
  };
}

export default async function DonorsPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <DonorContent locale={locale} />
    </main>
  );
}
