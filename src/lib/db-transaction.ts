import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type DbTx = Omit<
  Prisma.TransactionClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
>;

const TX_OPTIONS = {
  maxWait: 10_000,
  timeout: 30_000,
} as const;

/** Run work in a Prisma interactive transaction with generous serverless-friendly limits. */
export async function runInTransaction<T>(fn: (tx: DbTx) => Promise<T>): Promise<T> {
  return prisma.$transaction(fn, TX_OPTIONS);
}
