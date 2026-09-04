import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, withDbTimeout } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const userId = session?.user?.id || "demo-user-1";

    try {
      const conv = await withDbTimeout(
        prisma.conversation.findUnique({
          where: { id },
          include: {
            messages: {
              orderBy: { createdAt: "asc" },
              select: { id: true, role: true, content: true, createdAt: true },
            },
          },
        }),
        1000
      );

      if (!conv) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
      }

      return NextResponse.json(conv);
    } catch {
      // Fallback response
      return NextResponse.json({
        id,
        userId,
        title: "Conversation",
        messages: [],
      });
    }
  } catch (error) {
    console.error("GET /api/conversations/[id] error:", error);
    return NextResponse.json({ error: "Failed to retrieve conversation" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title } = body;

    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Invalid title" }, { status: 400 });
    }

    try {
      const updated = await withDbTimeout(
        prisma.conversation.update({
          where: { id },
          data: { title: title.trim() },
        }),
        1000
      );
      return NextResponse.json(updated);
    } catch {
      return NextResponse.json({ id, title: title.trim() });
    }
  } catch (error) {
    console.error("PATCH /api/conversations/[id] error:", error);
    return NextResponse.json({ error: "Failed to update conversation" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    try {
      await withDbTimeout(
        prisma.conversation.delete({
          where: { id },
        }),
        1000
      );
      return NextResponse.json({ success: true });
    } catch {
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error("DELETE /api/conversations/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 });
  }
}
