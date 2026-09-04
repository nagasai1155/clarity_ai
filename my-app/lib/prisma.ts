import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Executes a database operation with a strict timeout (default 1500ms).
 * Prevents API routes from hanging when database credentials or network are unreachable.
 */
export async function withDbTimeout<T>(
  promise: PromiseLike<T>,
  timeoutMs = 1500
): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Database timed out after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
}
