import { AdminSettingsForm } from "@/components/admin-settings-form";
import { prisma } from "@/lib/prisma";

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
  });

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Site settings</h1>
        <p className="text-sm text-slate-400">
          Payment instructions displayed on the user deposit screen.
        </p>
      </div>
      <AdminSettingsForm initial={settings?.bankDisplayText ?? ""} />
    </div>
  );
}
