import { db } from "@/lib/db";
import { FestivalForm } from "@/components/admin/festival-form";
import { notFound } from "next/navigation";

export default async function EditFestivalPage(props: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await props.params;

  const festival = await db.festivalYear.findUnique({
    where: { id },
  });

  if (!festival) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Festival Year</h1>
        <p className="text-muted-foreground mt-2">
          Update the settings for {festival.year}.
        </p>
      </div>

      <FestivalForm initialData={festival} locale={locale} />
    </div>
  );
}
