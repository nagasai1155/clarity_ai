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

/**
 * Ensures a valid user exists in the database for foreign key constraints,
 * whether using Google OAuth, an existing session token, or Guest/Demo mode.
 */
export async function getOrCreateUser(sessionUser?: {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}): Promise<string> {
  const email = sessionUser?.email?.trim();
  const name = sessionUser?.name || "User";
  const rawId = sessionUser?.id || undefined;

  // 1. If we have an email, check if user exists in DB by email
  if (email) {
    try {
      const existingByEmail = await withDbTimeout(
        prisma.user.findUnique({ where: { email } }),
        1000
      );
      if (existingByEmail) {
        return existingByEmail.id;
      }
    } catch {}
  }

  // 2. If we have an ID, check if user exists in DB by ID
  if (rawId) {
    try {
      const existingById = await withDbTimeout(
        prisma.user.findUnique({ where: { id: rawId } }),
        1000
      );
      if (existingById) {
        return existingById.id;
      }
    } catch {}
  }

  // 3. Upsert user into database
  const idToUse = rawId || "demo-user-1";
  try {
    const user = await withDbTimeout(
      prisma.user.upsert({
        where: { id: idToUse },
        update: {
          name: name || undefined,
          email: email || undefined,
        },
        create: {
          id: idToUse,
          name: name || (idToUse === "demo-user-1" ? "Guest Explorer" : "User"),
          email: email || (idToUse === "demo-user-1" ? "demo@clarity.ai" : null),
        },
      }),
      1000
    );
    return user.id;
  } catch {
    // If upsert threw (e.g. unique email conflict), fallback to finding by email
    if (email) {
      try {
        const fallback = await withDbTimeout(
          prisma.user.findUnique({ where: { email } }),
          1000
        );
        if (fallback) return fallback.id;
      } catch {}
    }
  }

  return idToUse;
}
