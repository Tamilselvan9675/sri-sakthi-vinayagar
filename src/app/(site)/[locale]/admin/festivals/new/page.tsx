import { FestivalForm } from "@/components/admin/festival-form";

export default async function NewFestivalPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Festival Year</h1>
        <p className="text-muted-foreground mt-2">
          Create a new festival year to organize upcoming events.
        </p>
      </div>

      <FestivalForm locale={locale} />
    </div>
  );
}
