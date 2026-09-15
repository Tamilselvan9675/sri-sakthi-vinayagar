"use client";

import { useState } from "react";
import { DataTable } from "@/components/admin/data-table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Check, X, Download } from "lucide-react";
import { verifyDonation } from "./actions";
import { PaymentStatus, Donation } from "@/generated/prisma/client";
import { toast } from "sonner";
import Link from "next/link";

export default function DonationsClient({
  donations
}: {
  donations: Donation[]
}) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleVerify = async (id: string, status: PaymentStatus) => {
    if (confirm(`Are you sure you want to mark this donation as ${status}?`)) {
      setIsUpdating(id);
      const res = await verifyDonation(id, status);
      setIsUpdating(null);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Donation marked as ${status}`);
      }
    }
  };

  const columns = [
    { 
      header: "Date", 
      accessorKey: "donatedAt",
      cell: (item: Donation) => format(new Date(item.donatedAt), "PP p")
    },
    { 
      header: "Donor Name", 
      accessorKey: "donorName",
      cell: (item: Donation) => item.donorName || "Anonymous"
    },
    { header: "Phone", accessorKey: "donorPhone" },
    { 
      header: "Amount (₹)", 
      accessorKey: "amount",
      cell: (item: Donation) => `₹${Number(item.amount).toFixed(2)}`
    },
    { header: "Method", accessorKey: "paymentMethod" },
    { 
      header: "Status", 
      accessorKey: "status",
      cell: (item: Donation) => {
        let color = "bg-gray-100 text-gray-800";
        if (item.status === "COMPLETED") color = "bg-green-100 text-green-800";
        if (item.status === "PENDING") color = "bg-yellow-100 text-yellow-800";
        if (item.status === "FAILED") color = "bg-red-100 text-red-800";
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>
            {item.status}
          </span>
        );
      }
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (item: Donation) => (
        <div className="flex justify-end gap-2">
          {item.status === "PENDING" && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-green-600 border-green-200 hover:bg-green-50"
                disabled={isUpdating === item.id}
                onClick={() => handleVerify(item.id, "COMPLETED")}
              >
                <Check className="h-4 w-4 mr-1" /> Verify
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 border-red-200 hover:bg-red-50"
                disabled={isUpdating === item.id}
                onClick={() => handleVerify(item.id, "FAILED")}
              >
                <X className="h-4 w-4 mr-1" /> Reject
              </Button>
            </>
          )}
          {item.status === "COMPLETED" && (
            <Button variant="secondary" size="sm" render={<Link href={`/api/pdf/receipt?id=${item.id}`} target="_blank" />}>
              <Download className="h-4 w-4 mr-1" /> Receipt
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Donations</h1>
        <p className="text-muted-foreground mt-2">
          Manage temple donations and verify manual payments.
        </p>
      </div>

      <div className="bg-card border border-border rounded-md shadow-sm p-4">
        <DataTable
          data={donations}
          columns={columns}
          searchKey="donorName"
          searchPlaceholder="Search donor name..."
        />
      </div>
    </div>
  );
}
