"use client";

import { signOut } from "next-auth/react";

export function SignOutButton({
  className,
  label = "Logout",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className={className}
    >
      {label}
    </button>
  );
}
