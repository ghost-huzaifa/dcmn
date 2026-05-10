"use client";

import { registerUser } from "@/actions/register";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function RegisterForm({ defaultReference }: { defaultReference: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(e.currentTarget);
    const res = await registerUser(form);
    if (!res.ok) {
      setError(res.error ?? "Registration failed.");
      setPending(false);
      return;
    }
    router.push("/login");
    router.refresh();
    setPending(false);
  }

  return (
    <>
      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-3xl border border-violet-100 bg-white p-6 shadow-xl shadow-violet-100/50"
      >
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
            minLength={3}
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Email (optional)
          <input
            name="email"
            type="email"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-violet-500 focus:ring-2"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Phone (optional)
          <input
            name="phone"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-violet-500 focus:ring-2"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Password
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-violet-500 focus:ring-2"
            required
            minLength={6}
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Referral code (optional)
          <input
            name="reference"
            defaultValue={defaultReference}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-violet-500 focus:ring-2"
            placeholder="Friend's reference code"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-violet-600 py-3 font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
        >
          {pending ? "Creating…" : "Register"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-violet-600 hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
