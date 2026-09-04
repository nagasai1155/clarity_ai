import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, withDbTimeout } from "@/lib/prisma";

// In-memory fallback store for when database is not connected yet
const inMemoryConversations: Record<string, Array<{ id: string; title: string; createdAt: Date; updatedAt: Date; userId: string }>> = {};

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id || "demo-user-1";

    // Attempt DB query with fast 1s timeout
    try {
      const conversations = await withDbTimeout(
        prisma.conversation.findMany({
          where: { userId },
          orderBy: { updatedAt: "desc" },
          select: { id: true, title: true, updatedAt: true },
        }),
        1000
      );
      return NextResponse.json(conversations);
    } catch {
      // Fallback to in-memory store if DB is not configured or slow
      const userConvs = inMemoryConversations[userId] || [];
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
    const userId = session?.user?.id || "demo-user-1";
    const body = await req.json().catch(() => ({}));
    const title = body?.title || "New Chat";

    try {
      const newConv = await withDbTimeout(
        prisma.conversation.create({
          data: {
            userId,
            title,
          },
        }),
        1000
      );
      return NextResponse.json(newConv, { status: 201 });
    } catch {
      // In-memory fallback
      const newConv = {
        id: `conv-${Date.now()}`,
        userId,
        title,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      if (!inMemoryConversations[userId]) {
        inMemoryConversations[userId] = [];
      }
      inMemoryConversations[userId].unshift(newConv);
      return NextResponse.json(newConv, { status: 201 });
    }
  } catch (error) {
    console.error("POST /api/conversations error:", error);
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }
}
