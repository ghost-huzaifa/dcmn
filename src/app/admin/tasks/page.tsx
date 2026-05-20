import { AdminTasksPanel } from "@/components/admin-tasks-panel";
import { dateKeyKarachi } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const dateKey = date?.match(/^\d{4}-\d{2}-\d{2}$/) ? date : dateKeyKarachi();

  const tasks = await prisma.adminTask.findMany({
    where: { dateKey },
    orderBy: { position: "asc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Daily tasks</h1>
        <p className="text-sm text-slate-400">
          Post tasks with video URLs for users to complete each day (Asia/Karachi).
        </p>
      </div>

      <form method="get" className="flex flex-wrap items-end gap-3">
        <label className="text-sm text-slate-300">
          Date
          <input
            type="date"
            name="date"
            defaultValue={dateKey}
            className="mt-1 block rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white"
          />
        </label>
        <button
          type="submit"
          className="rounded-xl bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-600"
        >
          View date
        </button>
        <Link
          href="/admin/tasks"
          className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:text-white"
        >
          Today
        </Link>
      </form>

      <AdminTasksPanel
        dateKey={dateKey}
        tasks={tasks.map((t) => ({
          id: t.id,
          title: t.title,
          videoUrl: t.videoUrl,
          position: t.position,
        }))}
      />
    </div>
  );
}
