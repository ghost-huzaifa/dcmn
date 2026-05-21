import Link from "next/link";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPkr, formatRs } from "@/lib/money";
import { getWalletTotals } from "@/lib/stats";
import { whatsappUrl } from "@/lib/whatsapp";
import { UserPlanStatus } from "@prisma/client";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, settings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        userPlans: {
          where: { status: UserPlanStatus.ACTIVE },
          include: { plan: true },
          take: 1,
        },
      },
    }),
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
  ]);

  if (!user) redirect("/login");

  const totals = await getWalletTotals(user.id);
  const activePlan = user.userPlans[0];
  const needsPlan = !activePlan;
  const wa = whatsappUrl(
    settings?.whatsappNumber ?? "+447836532206",
    "Hello, I need support with my Growvi account."
  );

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8 pb-24">
      <header className="rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4 text-white shadow-lg shadow-violet-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold tracking-wide">Growvi Secure Growth</span>
          <span className="text-xs opacity-90">Menu</span>
        </div>
      </header>

      <section className="rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 px-5 py-6 text-white shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm opacity-90">Welcome,</p>
            <p className="text-xl font-bold">{user.username}</p>
            <p className="mt-4 flex items-center gap-2 text-lg">
              <span className="text-yellow-300">●</span>
              <span>Balance:</span>
              <span className="font-semibold">{formatRs(user.balance)}</span>
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2">
            <Link
              href="/user/deposit"
              className="rounded-2xl bg-violet-500 px-4 py-3 text-center text-xs font-semibold text-white shadow-md hover:bg-violet-400"
            >
              Deposit
            </Link>
            <Link
              href="/user/withdraw"
              className="rounded-2xl bg-emerald-500 px-4 py-3 text-center text-xs font-semibold text-white shadow-md hover:bg-emerald-400"
            >
              Withdraw
            </Link>
          </div>
        </div>
      </section>

      {needsPlan && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700">
          You need to activate a plan first. Buy a plan and complete your deposit.
        </div>
      )}

      <nav className="grid grid-cols-3 gap-3 text-center text-xs font-medium">
        <Tile href="/plans" label="Buy Hens" className="bg-sky-500" />
        <Tile href="/user/ptc" label="Collect Egg" className="bg-orange-500" />
        <Tile href="/user/referred-users" label="Team" className="bg-pink-500" />
        <Tile href="/user/deposit/history" label="D-History" className="bg-indigo-600" />
        <Tile href="/user/withdraw/history" label="w-log" className="bg-teal-600" />
        <div className="flex flex-col items-center justify-center rounded-2xl bg-red-500 px-2 py-4 text-white shadow-md">
          <SignOutButton className="text-xs font-medium" label="Logout" />
        </div>
      </nav>

      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3 text-center text-sm font-semibold text-white shadow-md hover:bg-[#20bd5a]"
      >
        <span aria-hidden>💬</span>
        Contact us on WhatsApp
      </a>

      <section className="space-y-3">
        <StatCard
          title="Total Investment"
          value={formatPkr(totals.totalInvestment)}
          accent="text-sky-600"
        />
        <StatCard
          title="Total Withdraw"
          value={formatPkr(totals.totalWithdraw)}
          accent="text-pink-600"
        />
        <StatCard
          title="Total Commissions"
          value={formatPkr(totals.totalCommissions)}
          accent="text-emerald-600"
        />
      </section>

      {activePlan && (
        <p className="text-center text-xs text-slate-500">
          Active plan: <strong>{activePlan.plan.code}</strong> — Daily wage cap{" "}
          {formatPkr(activePlan.plan.dailyWage)} / day.
        </p>
      )}
    </div>
  );
}

function Tile({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className: string;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center rounded-2xl px-2 py-4 text-white shadow-md ${className}`}
    >
      {label}
    </Link>
  );
}

function StatCard({
  title,
  value,
  accent,
}: {
  title: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm">
      <div>
        <p className={`text-lg font-bold ${accent}`}>{value}</p>
        <p className="text-xs text-slate-500">{title}</p>
      </div>
      <div className="h-10 w-10 rounded-xl bg-slate-100" aria-hidden />
    </div>
  );
}
