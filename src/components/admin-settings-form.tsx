"use client";

import { updateSiteSettings } from "@/actions/admin-settings";
import { useTransition } from "react";

export type SiteSettingsFormValues = {
  bankDisplayText: string;
  whatsappNumber: string;
  welcomeBonusPct: string;
  refLevel1Pct: string;
  refLevel2Pct: string;
  refLevel3Pct: string;
  taskOverrideLevel1Pct: string;
  taskOverrideLevel2Pct: string;
  taskOverrideLevel3Pct: string;
};

export function AdminSettingsForm({ initial }: { initial: SiteSettingsFormValues }) {
  const [pending, start] = useTransition();

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => {
          await updateSiteSettings(fd);
        });
      }}
    >
      <label className="block text-sm font-medium text-slate-200">
        Bank account display (shown on Deposit page)
        <textarea
          name="bankDisplayText"
          defaultValue={initial.bankDisplayText}
          rows={10}
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm text-white outline-none ring-sky-500 focus:ring-2"
        />
      </label>

      <label className="block text-sm font-medium text-slate-200">
        WhatsApp number (E.164, e.g. +447836532206)
        <input
          name="whatsappNumber"
          defaultValue={initial.whatsappNumber}
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none ring-sky-500 focus:ring-2"
        />
      </label>

      <fieldset className="space-y-3 rounded-xl border border-slate-800 p-4">
        <legend className="px-2 text-sm font-semibold text-white">Deposit bonuses (%)</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <PctField label="Welcome bonus (new user)" name="welcomeBonusPct" value={initial.welcomeBonusPct} />
          <PctField label="Referral A level" name="refLevel1Pct" value={initial.refLevel1Pct} />
          <PctField label="Referral B level" name="refLevel2Pct" value={initial.refLevel2Pct} />
          <PctField label="Referral C level" name="refLevel3Pct" value={initial.refLevel3Pct} />
        </div>
      </fieldset>

      <fieldset className="space-y-3 rounded-xl border border-slate-800 p-4">
        <legend className="px-2 text-sm font-semibold text-white">Task completion overrides (% of per-task commission)</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <PctField label="A level" name="taskOverrideLevel1Pct" value={initial.taskOverrideLevel1Pct} />
          <PctField label="B level" name="taskOverrideLevel2Pct" value={initial.taskOverrideLevel2Pct} />
          <PctField label="C level" name="taskOverrideLevel3Pct" value={initial.taskOverrideLevel3Pct} />
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}

function PctField({
  label,
  name,
  value,
}: {
  label: string;
  name: string;
  value: string;
}) {
  return (
    <label className="block text-xs text-slate-300">
      {label}
      <input
        name={name}
        type="number"
        step="0.01"
        min="0"
        max="100"
        defaultValue={value}
        required
        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-sky-500 focus:ring-2"
      />
    </label>
  );
}
