"use client";

import { uploadDepositScreenshot } from "@/actions/deposit";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function DepositScreenshotForm({
  depositId,
  screenshotMime,
  screenshotData,
}: {
  depositId: string;
  screenshotMime: string | null;
  screenshotData: string | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const preview =
    screenshotData && screenshotMime
      ? `data:${screenshotMime};base64,${screenshotData}`
      : null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-slate-600">Payment screenshot</p>
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Payment screenshot"
          className="max-h-48 w-full rounded-xl border border-slate-200 object-contain"
        />
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
      <label className="block">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          capture="environment"
          disabled={pending}
          className="w-full text-xs text-slate-600"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setError(null);
            const reader = new FileReader();
            reader.onload = () => {
              const dataUrl = reader.result as string;
              start(async () => {
                const r = await uploadDepositScreenshot(depositId, dataUrl);
                if (!r.ok) {
                  setError(r.error ?? "Upload failed.");
                  return;
                }
                router.refresh();
              });
            };
            reader.readAsDataURL(file);
          }}
        />
      </label>
      <p className="text-[10px] text-slate-400">Max 2 MB · JPEG, PNG, WebP, or GIF</p>
    </div>
  );
}
