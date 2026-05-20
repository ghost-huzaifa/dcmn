import {
  AdminSettingsForm,
  type SiteSettingsFormValues,
} from "@/components/admin-settings-form";
import { prisma } from "@/lib/prisma";

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
  });

  const initial: SiteSettingsFormValues = {
    bankDisplayText: settings?.bankDisplayText ?? "",
    whatsappNumber: settings?.whatsappNumber ?? "+447836532206",
    welcomeBonusPct: settings?.welcomeBonusPct.toString() ?? "7",
    refLevel1Pct: settings?.refLevel1Pct.toString() ?? "12",
    refLevel2Pct: settings?.refLevel2Pct.toString() ?? "4",
    refLevel3Pct: settings?.refLevel3Pct.toString() ?? "1",
    taskOverrideLevel1Pct: settings?.taskOverrideLevel1Pct.toString() ?? "5",
    taskOverrideLevel2Pct: settings?.taskOverrideLevel2Pct.toString() ?? "2",
    taskOverrideLevel3Pct: settings?.taskOverrideLevel3Pct.toString() ?? "1",
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Site settings</h1>
        <p className="text-sm text-slate-400">
          Payment instructions, WhatsApp support, and commission percentages.
        </p>
      </div>
      <AdminSettingsForm initial={initial} />
    </div>
  );
}
