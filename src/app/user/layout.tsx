import { UserShell } from "@/components/user-shell";

export default function UserSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserShell>{children}</UserShell>;
}
