import { UserShell } from "@/components/user-shell";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function PlansLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    const pathname = (await headers()).get("x-pathname") ?? "/plans";
    redirect(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
  }

  return <UserShell>{children}</UserShell>;
}
