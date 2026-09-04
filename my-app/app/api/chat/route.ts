import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, withDbTimeout } from "@/lib/prisma";
import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id || "demo-user-1";
    const body = await req.json();
    const { conversationId, message, messages = [] } = body;

    if (!message && messages.length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const currentMessage = message || messages[messages.length - 1]?.content;

    // 1. Ensure conversation exists & persist user message with fast timeout (max 1.2s)
    let convId = conversationId;
    try {
      if (!convId) {
        const newConv = await withDbTimeout<{ id: string }>(
          prisma.conversation.create({
            data: {
              userId,
              title: currentMessage ? currentMessage.slice(0, 36) : "New Chat",
            },
          }),
          1200
        );
        convId = newConv.id;
      }

      // Save user message in background
      withDbTimeout(
        prisma.message.create({
          data: {
            conversationId: convId,
            role: "user",
            content: currentMessage,
          },
        }),
        1200
      ).catch(() => {});
    } catch {
      // Fallback in-memory ID if database is offline or credentials invalid
      if (!convId) convId = `conv-${Date.now()}`;
    }

    // 2. Stream generation
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.trim().length > 0) {
      try {
        const google = createGoogleGenerativeAI({ apiKey });
        const modelName = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

        const formattedMessages = messages.length > 0
          ? messages.map((m: { role: string; content: string }) => ({
              role: m.role as "user" | "assistant" | "system",
              content: m.content,
            }))
          : [{ role: "user" as const, content: currentMessage }];

        const result = streamText({
          model: google(modelName),
          messages: formattedMessages,
          onFinish: async ({ text }) => {
            try {
              await withDbTimeout(
                prisma.message.create({
                  data: {
                    conversationId: convId,
                    role: "assistant",
                    content: text,
                  },
                }),
                1500
              );
              await withDbTimeout(
                prisma.conversation.update({
                  where: { id: convId },
                  data: { updatedAt: new Date() },
                }),
                1500
              );
            } catch {
              // Ignore DB persistence failures gracefully
            }
          },
        });

        const response = result.toTextStreamResponse();
        response.headers.set("x-conversation-id", convId);
        return response;
      } catch (sdkErr) {
        console.error("Gemini SDK streaming error:", sdkErr);
        return NextResponse.json(
          { error: `Gemini API error: ${(sdkErr as Error).message}` },
          { status: 500 }
        );
      }
    }

    // 3. Realistic preview streaming when GEMINI_API_KEY is empty
    const mockReply =
      `### Hello! I am Clarity AI 🌟\n\nI am currently operating in **UI Preview & Test Mode** because your \`GEMINI_API_KEY\` has not been configured in \`.env.local\` yet.\n\nEverything is working smoothly! Add your \`GEMINI_API_KEY\` to start chatting with Google Gemini.`;

    const encoder = new TextEncoder();
    const words = mockReply.split(" ");
    let index = 0;

    const stream = new ReadableStream({
      async start(controller) {
        const interval = setInterval(() => {
          if (index < words.length) {
            const chunk = (index === 0 ? "" : " ") + words[index];
            controller.enqueue(encoder.encode(chunk));
            index++;
          } else {
            clearInterval(interval);
            controller.close();
          }
        }, 35);
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "x-conversation-id": convId,
      },
    });
  } catch (error) {
    console.error("POST /api/chat fatal error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI response" },
      { status: 500 }
    );
  }
}
