import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { whatsappUrl } from "@/lib/whatsapp";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  if (session?.user?.role === "ADMIN") {
    redirect("/admin");
  }
  if (session?.user) {
    redirect("/user/dashboard");
  }

  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  const wa = whatsappUrl(
    settings?.whatsappNumber ?? "+447836532206",
    "Hello, I would like to know more about DCMN."
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-8 px-6 py-16">
      <div className="space-y-2 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-violet-600">
          DCMN
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Secure Growth</h1>
        <p className="text-slate-600">
          Plans, daily egg tasks, referrals, and manual deposit / withdrawal verification.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <Link
          href="/login"
          className="rounded-2xl bg-violet-600 px-4 py-3 text-center font-semibold text-white shadow-lg shadow-violet-200 hover:bg-violet-700"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          className="rounded-2xl border border-violet-200 bg-white px-4 py-3 text-center font-semibold text-violet-700 hover:bg-violet-50"
        >
          Create account
        </Link>
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3 text-center font-semibold text-white shadow-md hover:bg-[#20bd5a]"
        >
          <span aria-hidden>💬</span>
          WhatsApp Support
        </a>
      </div>
    </main>
  );
}
