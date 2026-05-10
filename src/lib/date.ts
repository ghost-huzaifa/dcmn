/** Date key YYYY-MM-DD in Asia/Karachi for daily caps */
export function dateKeyKarachi(d = new Date()): string {
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Karachi" });
}
