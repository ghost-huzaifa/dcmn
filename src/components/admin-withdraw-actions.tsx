"use client";

import { approveWithdraw, rejectWithdraw } from "@/actions/admin-withdrawals";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function AdminWithdrawActions({ withdrawId }: { withdrawId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={pending}
        className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        onClick={() =>
          start(async () => {
            await approveWithdraw(withdrawId);
            router.refresh();
          })
        }
      >
        Approve
      </button>
      <button
        type="button"
        disabled={pending}
        className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        onClick={() =>
          start(async () => {
            await rejectWithdraw(withdrawId);
            router.refresh();
          })
        }
      >
        Reject
      </button>
    </div>
  );
}
