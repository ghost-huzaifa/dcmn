/** Build wa.me link from E.164-ish number (+447836532206) */
export function whatsappUrl(number: string, message?: string): string {
  const digits = number.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}
