import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import ReactPDF, { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";
import { PaymentStatus } from "@/generated/prisma/client";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 40,
    fontFamily: "Helvetica"
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: "#ea580c", // Primary brand color equivalent
    paddingBottom: 15,
  },
  templeName: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#ea580c"
  },
  reportTitle: {
    fontSize: 18,
    textAlign: "center",
    color: "#444",
    letterSpacing: 2
  },
  receiptInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
    padding: 15,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4
  },
  infoBlock: {
    flexDirection: "column",
    gap: 4
  },
  infoLabel: {
    fontSize: 10,
    color: "#6b7280",
    textTransform: "uppercase"
  },
  infoValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827"
  },
  amountBox: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff7ed", // orange-50
    padding: 30,
    borderWidth: 1,
    borderColor: "#fed7aa", // orange-200
    borderRadius: 8,
    marginBottom: 40
  },
  amountLabel: {
    fontSize: 14,
    color: "#ea580c",
    marginBottom: 10
  },
  amountValue: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#ea580c"
  },
  thankYou: {
    fontSize: 14,
    textAlign: "center",
    color: "#374151",
    lineHeight: 1.6,
    paddingHorizontal: 20
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 9,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 15,
  }
});

function ReceiptDocument({ 
  donation, 
  templeSettings 
}: { 
  donation: { 
    id: string, 
    donorName: string | null, 
    amount: { toFixed: (f?: number) => string }, 
    donatedAt: Date, 
    paymentReference: string | null,
    paymentMethod: string,
    festivalYear?: { year: number, titleEn: string } | null
  }, 
  templeSettings: { templeNameEn?: string | null, addressEn?: string | null, phone?: string | null } | null
}) {
  const templeName = templeSettings?.templeNameEn || "Vinayagar Temple";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.templeName}>{templeName}</Text>
          <Text style={styles.reportTitle}>DONATION RECEIPT</Text>
        </View>

        <View style={styles.receiptInfo}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Receipt No.</Text>
            <Text style={styles.infoValue}>{donation.id.slice(-8).toUpperCase()}</Text>
            
            <Text style={[styles.infoLabel, { marginTop: 15 }]}>Date</Text>
            <Text style={styles.infoValue}>{format(new Date(donation.donatedAt), 'dd MMM yyyy')}</Text>
          </View>
          
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Received With Thanks From</Text>
            <Text style={styles.infoValue}>{donation.donorName || "Anonymous Devotee"}</Text>

            <Text style={[styles.infoLabel, { marginTop: 15 }]}>Payment Method</Text>
            <Text style={styles.infoValue}>{donation.paymentMethod} {donation.paymentReference ? `(${donation.paymentReference})` : ""}</Text>
          </View>
        </View>

        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>Donation Amount</Text>
          <Text style={styles.amountValue}>Rs. {donation.amount.toFixed(2)}</Text>
        </View>

        <Text style={styles.thankYou}>
          May Lord Vinayagar bless you and your family with peace, prosperity, and happiness.
          We deeply appreciate your generous contribution towards the temple.
        </Text>

        <Text style={styles.footer}>
          {templeSettings?.addressEn || ""} • {templeSettings?.phone || ""}
          {"\n\n"}
          This is a computer-generated receipt and does not require a signature.
        </Text>
      </Page>
    </Document>
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("Donation ID is required", { status: 400 });
    }

    const [donation, templeSettings] = await Promise.all([
      db.donation.findUnique({
        where: { id },
        include: { festivalYear: true }
      }),
      db.templeSettings.findFirst()
    ]);

    if (!donation) {
      return new NextResponse("Donation not found", { status: 404 });
    }

    if (donation.status !== PaymentStatus.COMPLETED) {
      return new NextResponse("Receipts can only be generated for completed donations.", { status: 400 });
    }

    const pdfStream = await ReactPDF.renderToStream(
      <ReceiptDocument 
        donation={donation} 
        templeSettings={templeSettings} 
      />
    );

    return new NextResponse(pdfStream as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Donation_Receipt_${donation.id.slice(-8)}.pdf"`,
      },
    });

  } catch (error) {
    console.error("PDF Generation Error:", error);
    return new NextResponse("Failed to generate PDF", { status: 500 });
  }
}
