import { db } from "@/lib/db";
import DonationsClient from "./client";

export default async function DonationsAdminPage() {
  const donations = await db.donation.findMany({
    orderBy: { donatedAt: "desc" },
  });

  return <DonationsClient donations={donations} />;
}
