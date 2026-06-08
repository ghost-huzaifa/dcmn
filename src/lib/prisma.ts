import { PrismaClient } from "@prisma/client";

/**
 * Reuse one client per runtime. Always assign `globalThis.prisma` — including in
 * production — so hot reload / duplicate bundles don’t spawn extra clients during dev,
 * and serverless isolates don’t multiply connections unnecessarily.
 *
 * If you still see `EMAXCONNSESSION` / `max clients reached`:
 * - Use your provider’s **pooled** URL for `DATABASE_URL` (e.g. Neon **pooler** host
 *   `*.neon.tech` with `-pooler` / port **6543**, or Supabase **pooler** / Transaction mode).
 * - Set `DIRECT_DATABASE_URL` to the non-pooled/direct host — Prisma uses it for
 *   interactive transactions (`$transaction` callbacks). Without it, pooled PgBouncer
 *   links can throw “Transaction not found” during wallet credits / task completion.
 * - Avoid the non‑pooling “session/direct” URL for Vercel/serverless traffic — it caps
 *   concurrent connections very low (often ~15).
 */
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

globalForPrisma.prisma = prisma;
