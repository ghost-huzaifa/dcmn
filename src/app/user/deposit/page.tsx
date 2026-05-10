import { auth } from "@/auth";
import { DepositNoteForm } from "@/components/deposit-note-form";
import { prisma } from "@/lib/prisma";
import { formatPkr } from "@/lib/money";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DepositPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const settings = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
  });

  const pending = await prisma.depositRequest.findMany({
    where: { userId: session.user.id, status: "PENDING" },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-lg space-y-8 px-4 py-10 pb-24">
      <header className="space-y-2 text-center">
        <p className="text-2xl">💵</p>
        <h1 className="text-xl font-bold text-slate-900">Deposit</h1>
        <p className="text-sm text-slate-600">
          Transfer funds to the account below. Admin will verify manually.
        </p>
      </header>

      <section className="rounded-3xl border border-violet-100 bg-white p-5 shadow-lg">
        <h2 className="font-semibold text-slate-900">Bank details</h2>
        <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm text-slate-800">
          {settings?.bankDisplayText || "Bank details not configured yet."}
        </pre>
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold text-slate-900">Pending deposits</h2>
        {pending.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            No pending deposits. Purchase a plan from{" "}
            <Link href="/plans" className="font-semibold text-violet-600 underline">
              Plans
            </Link>{" "}
            to create one.
          </p>
        ) : (
          pending.map((d) => (
            <div
              key={d.id}
              className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-slate-900">
                  {d.plan?.code ?? "Deposit"}
                </span>
                <span>{formatPkr(d.amount)}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Submitted {d.createdAt.toLocaleString()}
              </p>
              <div className="mt-3">
                <DepositNoteForm depositId={d.id} initialNote={d.note} />
              </div>
            </div>
          ))
        )}
      </section>

      <div className="text-center">
        <Link href="/user/deposit/history" className="text-sm font-semibold text-violet-600 underline">
          Deposit history
        </Link>
      </div>
    </div>
  );
}
