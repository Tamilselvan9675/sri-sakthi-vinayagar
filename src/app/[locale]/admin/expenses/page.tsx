import { db } from "@/lib/db";
import { DataTable } from "@/components/admin/data-table";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, IndianRupee, Download } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ExpensesListPage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ year?: string }>;
}) {
  const { locale } = await props.params;
  const { year } = await props.searchParams;

  // Get all festival years for the filter
  const festivalYears = await db.festivalYear.findMany({
    orderBy: { year: "desc" },
  });

  const activeYearId = year || festivalYears[0]?.id;

  // Fetch expenses for the selected year
  const expenses = await db.expense.findMany({
    where: { festivalYearId: activeYearId },
    include: {
      category: true,
      festivalYear: true,
    },
    orderBy: { expenseDate: "desc" }
  });

  // Calculate totals
  const totalAmount = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  
  // Category totals
  const categoryTotals = expenses.reduce((acc, curr) => {
    const catName = curr.category.nameEn;
    acc[catName] = (acc[catName] || 0) + Number(curr.amount);
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track temple expenses with complete audit logging.
          </p>
        </div>
        
        <div className="flex gap-2 items-center">
          <Button variant="outline" render={<Link href={`/${locale}/admin/expense-categories`} />}>
            Manage Categories
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center bg-card p-4 rounded-md border border-border">
        <div className="flex items-center gap-4">
          <span className="font-medium">Filter by Year:</span>
          <div className="flex gap-2">
            {festivalYears.map(fy => (
              <Button 
                key={fy.id} 
                variant={activeYearId === fy.id ? "default" : "outline"} 
                size="sm"
                render={<Link href={`?year=${fy.id}`} />}
              >
                {fy.year}
              </Button>
            ))}
          </div>
        </div>
        
        {activeYearId && (
          <Button variant="secondary" render={<Link href={`/api/pdf/expenses?year=${activeYearId}`} target="_blank" />}>
            <Download className="mr-2 h-4 w-4" /> Export PDF
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <IndianRupee className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">₹{totalAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        {Object.entries(categoryTotals).slice(0, 3).map(([category, amount]) => (
          <Card key={category}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{category}</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">₹{amount.toFixed(2)}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-card border border-border rounded-md shadow-sm p-4">
        <DataTable
          data={expenses}
          searchKey="descriptionEn"
          searchPlaceholder="Search descriptions..."
          createHref={`/${locale}/admin/expenses/new`}
          createLabel="Log Expense"
          editHref={(item) => `/${locale}/admin/expenses/${item.id}`}
          columns={[
            { 
              header: "Date", 
              accessorKey: "expenseDate",
              cell: (item) => format(new Date(item.expenseDate), "PP")
            },
            { 
              header: "Category", 
              accessorKey: "categoryId",
              cell: (item) => item.category.nameEn
            },
            { header: "Description", accessorKey: "descriptionEn" },
            { 
              header: "Amount (₹)", 
              accessorKey: "amount",
              cell: (item) => `₹${Number(item.amount).toFixed(2)}`
            }
          ]}
        />
      </div>
    </div>
  );
}
