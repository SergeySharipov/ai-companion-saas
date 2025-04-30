import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { MemoryManager } from "@/lib/memory";
import { rateLimit } from "@/lib/rate-limit";
import prismadb from "@/lib/prismadb";
import {
  checkAiRequestsCount,
  decreaseAiRequestsCount,
} from "@/lib/user-settings";
import { checkSubscription } from "@/lib/subscription";

export async function POST(
  request: Request,
  props: { params: Promise<{ chatId: string }> },
) {
  const params = await props.params;
  try {
    const { prompt } = await request.json();
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const identifier = request.url + "-" + userId;
    const { success } = await rateLimit(identifier);

    if (success) {
      return new NextResponse("Payment Required", { status: 402 });
    }

    const isPro = await checkSubscription();

    if (!isPro) {
      const checkAiRequestsCountResp = await checkAiRequestsCount();

      if (!checkAiRequestsCountResp) {
        return new NextResponse("Premium subscription is required", {
          status: 402,
        });
      }
    }

    const companion = await prismadb.companion.update({
      where: {
        id: params.chatId,
      },
      data: {
        messages: {
          create: {
            content: prompt,
            role: "user",
            userId: userId,
          },
        },
      },
    });

    if (!companion) {
      return new NextResponse("Companion not found", { status: 404 });
    }

    const companion_file_name = companion.id + ".txt";

    const companionKey = {
      companionId: companion.id,
      userId: userId,
    };

    const memoryManager = await MemoryManager.getInstance();
    const existingRecords = await memoryManager.readLatestHistory(companionKey);

    if (existingRecords.length === 0) {
      await memoryManager.seedChatHistory(companion.seed, "\n\n", companionKey);
    }

    await memoryManager.writeToHistory(`User: ${prompt}\n`, companionKey);

    const recentChatHistory =
      await memoryManager.readLatestHistory(companionKey);

    const similarDocs = await memoryManager.vectorSearch(
      recentChatHistory,
      companion_file_name,
    );

    let relevantHistory = "";
    if (similarDocs && similarDocs.length > 0) {
      relevantHistory = similarDocs.map((doc) => doc.pageContent).join("\n");
    }

    const promptTemplate = `
    You are ${companion.name}, with the following backstory:

    ${companion.instructions}

    ---

    🧠 RELEVANT MEMORY
    ${relevantHistory || "None."}

    ---

    💬 CHAT HISTORY
    ${recentChatHistory}

    ---

    👤 USER MESSAGE
    ${prompt}

    ---

    Respond naturally, in character, and clearly. 
    Do not start your responses with roleplay formatting. 
    Avoid using stage directions, labeled actions, or describing emotions.
    Prefer short replies, but decide whether a short, medium, or long response fits best based on the User's message and context.
    Use paragraph breaks when necessary to separate ideas and improve readability.
    `.trim();

    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const model = process.env.OPENAI_API_MODEL_NAME;

    if (!model) {
      return;
    }

    const { text } = await generateText({
      model: openai.chat(model),
      prompt: promptTemplate,
    });

    await memoryManager.writeToHistory(
      `${companion.name}: ${text}\n`,
      companionKey,
    );

    await prismadb.companion.update({
      where: {
        id: params.chatId,
      },
      data: {
        messages: {
          create: {
            content: text,
            role: "system",
            userId: userId,
          },
        },
      },
    });

    if (!isPro) {
      await decreaseAiRequestsCount();
    }

    return new NextResponse(text, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
