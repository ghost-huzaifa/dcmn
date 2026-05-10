"use client";

import { collectEgg } from "@/actions/collect";
import { formatRs } from "@/lib/money";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function EggGrid({
  taskCommission,
  remaining,
  taskCount,
}: {
  taskCommission: string;
  remaining: number;
  taskCount: number;
}) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const slots = Array.from({ length: taskCount }, (_, i) => i);
  const completed = taskCount - remaining;

  function collect() {
    setMsg(null);
    start(async () => {
      const r = await collectEgg();
      if (!r.ok) {
        setMsg(r.error ?? "Try again.");
        return;
      }
      setMsg(`Earned ${formatRs(r.earned ?? taskCommission)}`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {msg && (
        <p className="rounded-2xl bg-white/10 px-4 py-2 text-center text-sm font-medium text-white">
          {msg}
        </p>
      )}
      <div className="flex flex-wrap justify-center gap-3">
        {slots.map((i) => {
          const done = i < completed;
          return (
            <button
              key={i}
              type="button"
              disabled={pending || done || remaining <= 0}
              onClick={collect}
              className={`flex min-h-[100px] min-w-[100px] flex-col items-center justify-center rounded-full border-2 border-cyan-200 bg-gradient-to-br from-cyan-400/40 to-blue-600/50 px-3 py-4 text-center text-xs font-semibold text-white shadow-inner shadow-cyan-200/50 backdrop-blur-sm transition hover:brightness-110 disabled:opacity-40 ${
                done ? "opacity-50 line-through" : ""
              }`}
            >
              <span>{formatRs(taskCommission)}</span>
              <span className="mt-1 text-[10px] font-normal opacity-90">
                {done ? "done" : "collect egg"}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-center text-xs text-sky-100">
        {remaining} of {taskCount} collects left today (Asia/Karachi).
      </p>
    </div>
  );
}
