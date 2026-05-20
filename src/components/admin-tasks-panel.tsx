"use client";

import { createAdminTask, deleteAdminTask } from "@/actions/admin-tasks";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type TaskItem = {
  id: string;
  title: string;
  videoUrl: string;
  position: number;
};

export function AdminTasksPanel({
  dateKey,
  tasks,
}: {
  dateKey: string;
  tasks: TaskItem[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="space-y-8">
      <form
        className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const fd = new FormData(form);
          setError(null);
          start(async () => {
            const r = await createAdminTask(
              String(fd.get("title") ?? ""),
              String(fd.get("videoUrl") ?? ""),
              String(fd.get("dateKey") ?? dateKey)
            );
            if (!r.ok) {
              setError(r.error ?? "Failed.");
              return;
            }
            form.reset();
            const dateInput = form.elements.namedItem("dateKey") as HTMLInputElement | null;
            if (dateInput) dateInput.value = dateKey;
            router.refresh();
          });
        }}
      >
        <h2 className="font-semibold text-white">Add task for {dateKey}</h2>
        <input type="hidden" name="dateKey" defaultValue={dateKey} />
        <label className="block text-sm text-slate-300">
          Title
          <input
            name="title"
            required
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-sky-500 focus:ring-2"
          />
        </label>
        <label className="block text-sm text-slate-300">
          Video URL
          <input
            name="videoUrl"
            type="url"
            required
            placeholder="https://..."
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-sky-500 focus:ring-2"
          />
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
        >
          {pending ? "Adding…" : "Add task"}
        </button>
      </form>

      <section className="space-y-3">
        <h2 className="font-semibold text-white">Tasks ({tasks.length})</h2>
        {tasks.length === 0 ? (
          <p className="text-sm text-slate-500">No tasks for this date.</p>
        ) : (
          tasks.map((t) => (
            <div
              key={t.id}
              className="flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-900 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="text-sm">
                <p className="font-semibold text-white">{t.title}</p>
                <a
                  href={t.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-sky-400 hover:underline"
                >
                  {t.videoUrl}
                </a>
              </div>
              <button
                type="button"
                disabled={pending}
                className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                onClick={() =>
                  start(async () => {
                    await deleteAdminTask(t.id);
                    router.refresh();
                  })
                }
              >
                Delete
              </button>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
