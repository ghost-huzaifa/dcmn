import { SignOutButton } from "@/components/sign-out-button";
import { auth } from "@/auth";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/deposits", label: "Deposits" },
  { href: "/admin/withdrawals", label: "Withdrawals" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const pathname = (await headers()).get("x-pathname") ?? "/admin";

  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
  }
  if (session.user.role !== "ADMIN") {
    redirect("/user/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 bg-slate-900/80">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-4">
          <span className="font-bold text-white">Admin</span>
          <nav className="flex flex-wrap gap-3 text-sm">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-white text-slate-400">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex flex-wrap items-center gap-3">
            <SignOutButton
              className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
              label="Logout"
            />
            <Link href="/" className="text-xs text-slate-500 hover:text-white">
              Exit to site
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
}
