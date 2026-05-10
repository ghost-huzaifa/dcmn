"use client";

import { requestWithdraw } from "@/actions/withdraw";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function WithdrawForm({ maxHint }: { maxHint: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        setError(null);
        start(async () => {
          const res = await requestWithdraw(
            String(fd.get("amount") ?? ""),
            String(fd.get("bankDetails") ?? "")
          );
          if (!res.ok) {
            setError(res.error ?? "Failed.");
            return;
          }
          form.reset();
          router.refresh();
        });
      }}
    >
      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      <label className="block text-sm font-medium text-slate-700">
        Amount (PKR)
        <input
          name="amount"
          type="number"
          step="0.01"
          min="1"
          required
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-violet-500 focus:ring-2"
        />
      </label>
      <p className="text-xs text-slate-500">Available balance (hint): {maxHint}</p>
      <label className="block text-sm font-medium text-slate-700">
        Bank / wallet details
        <textarea
          name="bankDetails"
          required
          rows={4}
          placeholder="Account title, bank name, IBAN / account number"
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-violet-500 focus:ring-2"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Request withdrawal"}
      </button>
    </form>
  );
}
