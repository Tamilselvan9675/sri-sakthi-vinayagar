import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import ReactPDF, { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";

// NOTE: Since the requirements say "Support Tamil and English PDF output where technically practical",
// we would normally load a Tamil font here. 
// For this environment, we'll use standard fonts. If Tamil characters are passed to standard fonts in react-pdf, 
// they might appear as blank boxes or error unless a TrueType font containing Tamil glyphs is registered.
// Since we don't have a guaranteed TTF font in the local env, we will fall back to English data if a font isn't loaded,
// but for the sake of the requirement, we will output the data as it is. 
// In production, we would use: Font.register({ family: 'Tamil', src: 'path/to/tamil-font.ttf' });

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
    fontFamily: "Helvetica"
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#111",
    paddingBottom: 10,
  },
  templeName: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  reportTitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#444",
  },
  yearSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#f5f5f5",
  },
  summaryBlock: {
    flexDirection: "column",
  },
  summaryLabel: {
    fontSize: 10,
    color: "#666",
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
  },
  tableColHeader: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableCellHeader: {
    margin: 2,
    fontSize: 10,
    fontWeight: "bold",
  },
  tableCell: {
    margin: 2,
    fontSize: 9,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    color: "#888",
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  }
});

function ExpenseDocument({ 
  festivalYear, 
  expenses, 
  templeSettings 
}: { 
  festivalYear: { year: number, titleEn: string }, 
  expenses: Array<{ id: string, amount: { toFixed: (fractionDigits?: number) => string; toString: () => string }, expenseDate: Date, descriptionEn: string, category: { nameEn: string } }>, 
  templeSettings: { templeNameEn?: string } | null
}) {
  const totalAmount = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const templeName = templeSettings?.templeNameEn || "Vinayagar Temple";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.templeName}>{templeName}</Text>
          <Text style={styles.reportTitle}>Annual Expense Report - {festivalYear.year}</Text>
        </View>

        <View style={styles.yearSummary}>
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryLabel}>Festival</Text>
            <Text style={styles.summaryValue}>{festivalYear.titleEn}</Text>
          </View>
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryLabel}>Total Expenses</Text>
            <Text style={styles.summaryValue}>Rs. {totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Date</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Category</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Description</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Amount (Rs)</Text></View>
          </View>
          
          {expenses.map((expense) => (
            <View style={styles.tableRow} key={expense.id}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{format(new Date(expense.expenseDate), 'dd MMM yyyy')}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{expense.category.nameEn}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{expense.descriptionEn}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{Number(expense.amount).toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Generated securely on {format(new Date(), 'PPpp')} • Confidential Financial Document
        </Text>
      </Page>
    </Document>
  );
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "ADMIN", "FINANCE_MANAGER"].includes(session.user?.role as string)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const yearId = searchParams.get("year");

    if (!yearId) {
      return new NextResponse("Year ID is required", { status: 400 });
    }

    const [festivalYear, templeSettings] = await Promise.all([
      db.festivalYear.findUnique({
        where: { id: yearId },
        include: {
          expenses: {
            include: { category: true },
            orderBy: { expenseDate: 'asc' }
          }
        }
      }),
      db.templeSettings.findFirst()
    ]);

    if (!festivalYear) {
      return new NextResponse("Festival Year not found", { status: 404 });
    }

    const pdfStream = await ReactPDF.renderToStream(
      <ExpenseDocument 
        festivalYear={festivalYear} 
        expenses={festivalYear.expenses} 
        templeSettings={templeSettings} 
      />
    );

    return new NextResponse(pdfStream as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Expense_Report_${festivalYear.year}.pdf"`,
      },
    });

  } catch (error) {
    console.error("PDF Generation Error:", error);
    return new NextResponse("Failed to generate PDF", { status: 500 });
  }
}
