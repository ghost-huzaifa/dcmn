import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CopyReferralButton } from "@/components/copy-referral-button";
import { redirect } from "next/navigation";

export default async function ReferredUsersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });

  const referrals = await prisma.user.findMany({
    where: { referrerId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const origin =
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ?? "http://localhost:3001";
  const referralLink = `${origin}/register?reference=${encodeURIComponent(user.referenceCode)}`;

  return (
    <div className="mx-auto max-w-3xl space-y-8 bg-gradient-to-b from-sky-600 to-blue-950 px-4 py-10 pb-24 text-white">
      <header className="space-y-2 text-center">
        <h1 className="text-xl font-bold uppercase tracking-wide">
          Invite &amp; earn rewards
        </h1>
        <p className="text-sm text-sky-100">
          Share your referral link and earn rewards when friends activate plans.
        </p>
      </header>

      <section className="rounded-3xl bg-blue-950/60 p-5 shadow-xl backdrop-blur">
        <p className="text-sm font-semibold">Your referral link</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex-1 truncate rounded-xl bg-sky-100/10 px-3 py-2 text-xs">
            {referralLink}
          </div>
          <CopyReferralButton text={referralLink} />
        </div>
        <p className="mt-2 text-xs text-sky-200">Share this link to invite friends.</p>
      </section>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-blue-950/40">
        <div className="grid grid-cols-4 gap-2 bg-white/10 px-4 py-3 text-xs font-semibold uppercase">
          <span>Username</span>
          <span>Email</span>
          <span>Phone</span>
          <span>Joined</span>
        </div>
        <div className="max-h-[480px] overflow-auto">
          {referrals.length === 0 ? (
            <p className="py-10 text-center text-sm text-sky-200">
              No referrals found.
            </p>
          ) : (
            referrals.map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-4 gap-2 border-t border-white/5 px-4 py-3 text-xs"
              >
                <span>{r.username}</span>
                <span className="truncate">{r.email ?? "—"}</span>
                <span>{r.phone ?? "—"}</span>
                <span>{r.createdAt.toLocaleDateString()}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
