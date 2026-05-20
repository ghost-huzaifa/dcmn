"use client";

import { markTaskComplete } from "@/actions/collect";
import { formatRs } from "@/lib/money";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type TaskRow = {
  id: string;
  title: string;
  videoUrl: string;
  completed: boolean;
  earnedAmount: string | null;
};

export function TaskList({
  tasks,
  taskCommission,
  completedToday,
  dailyCap,
}: {
  tasks: TaskRow[];
  taskCommission: string;
  completedToday: number;
  dailyCap: number;
}) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (tasks.length === 0) {
    return (
      <div className="rounded-3xl bg-white/10 px-4 py-8 text-center text-sm">
        No tasks posted for today yet. Check back later.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {msg && (
        <p className="rounded-2xl bg-white/10 px-4 py-2 text-center text-sm font-medium">{msg}</p>
      )}
      <p className="text-center text-xs text-sky-100">
        {completedToday} of {dailyCap} tasks completed today (Asia/Karachi)
      </p>
      <ul className="space-y-3">
        {tasks.map((t) => (
          <li
            key={t.id}
            className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm"
          >
            <p className="font-semibold">{t.title}</p>
            <p className="mt-1 text-xs text-sky-100">
              Reward: {formatRs(taskCommission)} per task
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={t.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-blue-800 hover:bg-sky-50"
              >
                Watch video
              </a>
              {t.completed ? (
                <span className="rounded-xl bg-emerald-500/30 px-3 py-2 text-xs font-semibold text-emerald-100">
                  ✓ Done{t.earnedAmount ? ` — ${formatRs(t.earnedAmount)}` : ""}
                </span>
              ) : (
                <button
                  type="button"
                  disabled={pending || completedToday >= dailyCap}
                  onClick={() => {
                    setMsg(null);
                    start(async () => {
                      const r = await markTaskComplete(t.id);
                      if (!r.ok) {
                        setMsg(r.error ?? "Try again.");
                        return;
                      }
                      setMsg(`Earned ${formatRs(r.earned ?? taskCommission)}`);
                      router.refresh();
                    });
                  }}
                  className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-600 disabled:opacity-40"
                >
                  Mark complete
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
