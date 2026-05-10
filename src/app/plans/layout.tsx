import { UserShell } from "@/components/user-shell";

export default function PlansLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserShell>{children}</UserShell>;
}
