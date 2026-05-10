import { RegisterForm } from "./register-form";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const sp = await searchParams;
  const ref = sp.reference ?? "";

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="mb-8 space-y-1 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Create account</h1>
        <p className="text-sm text-slate-600">Join with an optional referral code</p>
      </div>
      <RegisterForm defaultReference={ref} />
    </main>
  );
}
