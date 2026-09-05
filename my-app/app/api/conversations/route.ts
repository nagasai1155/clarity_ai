import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, withDbTimeout, getOrCreateUser } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// In-memory fallback store for when database is not connected yet
const inMemoryConversations: Record<string, Array<{ id: string; title: string; createdAt: Date; updatedAt: Date; userId: string }>> = {};

export async function GET() {
  try {
    const session = await auth();
    const dbUserId = await getOrCreateUser(session?.user);

    // Attempt DB query with fast timeout
    try {
      const conversations = await withDbTimeout(
        prisma.conversation.findMany({
          where: { userId: dbUserId },
          orderBy: { updatedAt: "desc" },
          select: { id: true, title: true, updatedAt: true },
        }),
        1500
      );
      return NextResponse.json(conversations);
    } catch (dbErr) {
      console.error("GET /api/conversations DB error:", dbErr);
      // Fallback to in-memory store if DB is not configured or slow
      const userConvs = inMemoryConversations[dbUserId] || [];
      return NextResponse.json(userConvs);
    }
  } catch (error) {
    console.error("GET /api/conversations error:", error);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const dbUserId = await getOrCreateUser(session?.user);
    const body = await req.json().catch(() => ({}));
    const title = body?.title || "New Chat";

    try {
      const newConv = await withDbTimeout(
        prisma.conversation.create({
          data: {
            userId: dbUserId,
            title,
          },
        }),
        1500
      );
      return NextResponse.json(newConv, { status: 201 });
    } catch {
      // In-memory fallback
      const newConv = {
        id: `conv-${Date.now()}`,
        userId: dbUserId,
        title,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      if (!inMemoryConversations[dbUserId]) {
        inMemoryConversations[dbUserId] = [];
      }
      inMemoryConversations[dbUserId].unshift(newConv);
      return NextResponse.json(newConv, { status: 201 });
    }
  } catch (error) {
    console.error("POST /api/conversations error:", error);
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }
}
