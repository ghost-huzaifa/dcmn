"use client";

import { uploadDepositScreenshot } from "@/actions/deposit";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

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
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const preview =
    screenshotData && screenshotMime
      ? `data:${screenshotMime};base64,${screenshotData}`
      : null;

  function handleFile(file: File) {
    setError(null);
    setSuccess(null);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      start(async () => {
        const r = await uploadDepositScreenshot(depositId, dataUrl);
        if (!r.ok) {
          setError(r.error ?? "Upload failed.");
          return;
        }
        setSuccess("Screenshot uploaded successfully.");
        router.refresh();
      });
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-3 rounded-2xl border-2 border-violet-300 bg-violet-50 p-4 shadow-sm">
      <div>
        <p className="text-base font-bold text-slate-900">Payment screenshot</p>
        <p className="mt-1 text-sm text-slate-600">
          Required for verification — attach your bank receipt or transfer proof.
        </p>
      </div>

      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Payment screenshot"
          className="max-h-56 w-full rounded-xl border-2 border-violet-200 bg-white object-contain"
        />
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>
      )}
      {success && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
          {success}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        capture="environment"
        className="sr-only"
        disabled={pending}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      <button
        type="button"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-violet-400 bg-white px-4 py-6 text-center shadow-md transition hover:border-violet-600 hover:bg-violet-50 disabled:opacity-60"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 text-2xl text-white shadow-lg">
          📷
        </span>
        <span className="text-base font-bold text-violet-800">
          {pending
            ? "Uploading…"
            : preview
              ? "Tap to replace screenshot"
              : "Tap to choose payment screenshot"}
        </span>
        <span className="text-xs font-medium text-violet-600">
          Opens your gallery or camera
        </span>
      </button>

      <p className="text-center text-xs text-slate-500">
        Max 2 MB · JPEG, PNG, WebP, or GIF
      </p>
    </div>
  );
}
