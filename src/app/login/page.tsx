"use client";

import { getSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(e.currentTarget);
    const username = String(form.get("username") ?? "").trim();
    const password = String(form.get("password") ?? "");

    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid username or password.");
      setPending(false);
      return;
    }

    // Full-page navigation after `getSession()` so the next document request includes
    // the session cookie. `router.push` RSC fetches can run before the cookie applies → 307 to login.
    const session = await getSession();

    const callback = searchParams.get("callbackUrl");
    if (callback?.startsWith("/")) {
      window.location.assign(callback);
      return;
    }

    const dest = session?.user?.role === "ADMIN" ? "/admin" : "/user/dashboard";
    window.location.assign(dest);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="mb-8 space-y-1 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="text-sm text-slate-600">Sign in to continue</p>
      </div>
      <form className="space-y-4 rounded-3xl border border-violet-100 bg-white p-6 shadow-xl shadow-violet-100/50" onSubmit={onSubmit}>
        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        <label className="block text-sm font-medium text-slate-700">
          Username
          <input
            name="username"
            autoComplete="username"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-violet-500 focus:ring-2"
            required
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-violet-500 focus:ring-2"
            required
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-violet-600 py-3 font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        No account?{" "}
        <Link href="/register" className="font-semibold text-violet-600 hover:underline">
          Register
        </Link>
      </p>
    </main>
  );
}
