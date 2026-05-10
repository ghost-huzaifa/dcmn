"use client";

import { updateBankDisplayText } from "@/actions/admin-settings";
import { useTransition } from "react";

export function AdminSettingsForm({ initial }: { initial: string }) {
  const [pending, start] = useTransition();

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => {
          await updateBankDisplayText(String(fd.get("bankDisplayText") ?? ""));
        });
      }}
    >
      <label className="block text-sm font-medium text-slate-200">
        Bank account display (shown to users on Deposit page)
        <textarea
          name="bankDisplayText"
          defaultValue={initial}
          rows={12}
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm text-white outline-none ring-sky-500 focus:ring-2"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
