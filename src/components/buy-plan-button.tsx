"use client";

import { purchasePlan } from "@/actions/plan";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function BuyPlanButton({
  planId,
  label = "Buy Now",
}: {
  planId: string;
  label?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="w-full space-y-2">
      {error && (
        <p className="text-center text-xs font-medium text-red-600">{error}</p>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setError(null);
          start(async () => {
            const r = await purchasePlan(planId);
            if (!r.ok) {
              setError(r.error ?? "Could not start purchase.");
              return;
            }
            router.push("/user/deposit");
            router.refresh();
          });
        }}
        className="w-full rounded-2xl bg-sky-100 py-3 text-center text-sm font-bold text-sky-800 hover:bg-sky-200 disabled:opacity-60"
      >
        {pending ? "Please wait…" : label}
      </button>
    </div>
  );
}
