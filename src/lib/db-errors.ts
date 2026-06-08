/** Map low-level Prisma transaction failures to a short user-facing message. */
export function formatActionError(e: unknown, fallback: string): string {
  if (e instanceof Error) {
    const msg = e.message;
    if (
      msg.includes("Transaction not found") ||
      msg.includes("Transaction API error") ||
      msg.includes("Transaction already closed")
    ) {
      return "Database is busy — please try again in a moment.";
    }
    return msg;
  }
  return fallback;
}

/** Narrow unknown errors from Prisma / drivers so we can show a clearer message in the UI. */
export function isPrismaConnectionError(e: unknown): boolean {
  if (e instanceof Error) {
    const msg = `${e.name} ${e.message}`.toLowerCase();
    return (
      msg.includes("prisma") ||
      msg.includes("connect") ||
      msg.includes("database") ||
      msg.includes("econnrefused") ||
      msg.includes("etimedout") ||
      msg.includes("max clients") ||
      msg.includes("pool") ||
      msg.includes("password authentication failed") ||
      msg.includes("ssl")
    );
  }
  return false;
}
