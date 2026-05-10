"use client";

import { approveDeposit, rejectDeposit } from "@/actions/admin-deposits";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function AdminDepositActions({ depositId }: { depositId: string }) {
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
            await approveDeposit(depositId);
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
            await rejectDeposit(depositId);
            router.refresh();
          })
        }
      >
        Reject
      </button>
    </div>
  );
}
