"use client";

import { SignOutButton } from "@/components/sign-out-button";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links: Array<{ href: string; label: string }> = [
  { href: "/user/dashboard", label: "Home" },
  { href: "/plans", label: "Plans" },
  { href: "/user/ptc", label: "Eggs" },
  { href: "/user/deposit", label: "Deposit" },
  { href: "/user/withdraw", label: "Withdraw" },
];

export function UserShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-slate-50 to-violet-50">
      <aside className="hidden w-14 shrink-0 flex-col items-center gap-3 border-r border-violet-100 bg-slate-900 py-4 text-xs text-white md:flex">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-lg px-2 py-1 text-center leading-tight hover:bg-white/10 ${
              pathname === l.href ? "bg-white/15 font-semibold" : ""
            }`}
          >
            {l.label}
          </Link>
        ))}
        <SignOutButton
          className="mt-auto rounded-lg px-2 py-2 text-center text-[11px] font-semibold leading-tight text-red-200 hover:bg-white/10"
          label="Logout"
        />
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-violet-100 bg-white/90 px-4 py-3 backdrop-blur md:hidden">
          <span className="text-sm font-semibold text-violet-900">DCMN</span>
          <SignOutButton className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800" label="Logout" />
        </header>
        {children}
      </div>
    </div>
  );
}
