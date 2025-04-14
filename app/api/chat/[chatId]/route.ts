import { StreamingTextResponse, LangChainStream } from "ai";
import { currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { MemoryManager } from "@/lib/memory";
import { rateLimit } from "@/lib/rate-limit";
import prismadb from "@/lib/prismadb";
import { ChatOpenAI } from "@langchain/openai";
import { CallbackManager } from "@langchain/core/callbacks/manager";
import {
  checkAiRequestsCount,
  decreaseAiRequestsCount,
} from "@/lib/user-settings";
import { checkSubscription } from "@/lib/subscription";

export async function POST(
  request: Request,
  { params }: { params: { chatId: string } },
) {
  try {
    const { prompt } = await request.json();
    const user = await currentUser();

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const identifier = request.url + "-" + user.id;
    const { success } = await rateLimit(identifier);

    if (!success) {
      return new NextResponse("Rate limit exceeded", { status: 429 });
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
            userId: user.id,
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
      userId: user.id,
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

    const { handlers } = LangChainStream();

    const openai = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: process.env.OPENAI_API_MODEL_NAME,
      callbackManager: CallbackManager.fromHandlers(handlers),
    });

    openai.verbose = true;

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

    const resp = await openai.invoke(promptTemplate).catch(console.error);
    const content = resp?.content as string;

    if (!content && content?.length < 1) {
      return new NextResponse("content not found", { status: 404 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(content));
        controller.close();
      },
    });

    await memoryManager.writeToHistory(
      `${companion.name}: ${content}\n`,
      companionKey,
    );

    await prismadb.companion.update({
      where: {
        id: params.chatId,
      },
      data: {
        messages: {
          create: {
            content: content,
            role: "system",
            userId: user.id,
          },
        },
      },
    });

    if (!isPro) {
      await decreaseAiRequestsCount();
    }

    return new StreamingTextResponse(stream);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
