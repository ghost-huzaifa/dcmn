"use client";

import { updateDepositNote } from "@/actions/deposit";
import { useTransition } from "react";

export function DepositNoteForm({
  depositId,
  initialNote,
}: {
  depositId: string;
  initialNote: string | null;
}) {
  const [pending, start] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => {
          await updateDepositNote(depositId, String(fd.get("note") ?? ""));
        });
      }}
      className="space-y-2"
    >
      <textarea
        name="note"
        defaultValue={initialNote ?? ""}
        placeholder="Payment reference, receipt ID, sender bank…"
        rows={3}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none ring-violet-500 focus:ring-2"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save note"}
      </button>
    </form>
  );
}
