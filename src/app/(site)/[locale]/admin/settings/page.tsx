import { db } from "@/lib/db";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function SettingsPage() {
  const settings = await db.templeSettings.findFirst();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Temple Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage global temple information, contact details, and payment config.
        </p>
      </div>

      <SettingsForm initialData={settings} />
    </div>
  );
}
