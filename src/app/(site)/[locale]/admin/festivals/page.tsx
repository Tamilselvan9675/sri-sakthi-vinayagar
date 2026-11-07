import { db } from "@/lib/db";
import { DataTable } from "@/components/admin/data-table";
import { format } from "date-fns";

export default async function FestivalsListPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  const festivals = await db.festivalYear.findMany({
    orderBy: { year: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Festival Years</h1>
        <p className="text-muted-foreground mt-2">
          Manage all festival years. Each year acts as a container for its respective events, poojas, and galleries.
        </p>
      </div>

      <div className="bg-card border border-border rounded-md shadow-sm p-4">
        <DataTable
          data={festivals}
          searchKey="year"
          searchPlaceholder="Search year..."
          createHref={`/${locale}/admin/festivals/new`}
          createLabel="Add Year"
          editHref={(item) => `/${locale}/admin/festivals/${item.id}`}
          columns={[
            { header: "Year", accessorKey: "year" },
            { header: "English Title", accessorKey: "titleEn" },
            { header: "Tamil Title", accessorKey: "titleTa" },
            { 
              header: "Start Date", 
              accessorKey: "startDate",
              cell: (item) => format(new Date(item.startDate), "PP")
            },
            { 
              header: "End Date", 
              accessorKey: "endDate",
              cell: (item) => format(new Date(item.endDate), "PP")
            }
          ]}
        />
      </div>
    </div>
  );
}
