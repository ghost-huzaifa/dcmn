"use client";

import { useState } from "react";

export function CopyReferralButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      className="rounded-xl bg-blue-950 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-900"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 2000);
      }}
    >
      {done ? "Copied" : "Copy"}
    </button>
  );
}
