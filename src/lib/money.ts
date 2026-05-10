import type { Decimal } from "@prisma/client/runtime/library";

export function formatPkr(n: Decimal | number | string): string {
  const v = typeof n === "object" && n !== null && "toFixed" in n ? Number(n) : Number(n);
  if (Number.isNaN(v)) return "Pkr 0.00";
  return `Pkr ${v.toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatRs(n: Decimal | number | string): string {
  const v = typeof n === "object" && n !== null && "toFixed" in n ? Number(n) : Number(n);
  if (Number.isNaN(v)) return "Rs 0.00";
  return `Rs ${v.toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
