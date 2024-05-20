import dotenv from "dotenv";
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

dotenv.config({ path: `.env` });

export async function POST(
  request: Request,
  { params }: { params: { chatId: string } },
) {
  try {
    const { prompt } = await request.json();
    const user = await currentUser();

    if (!user || !user.firstName || !user.id) {
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

    const companion_file_name = companion.id! + ".txt";

    const companionKey = {
      companionId: companion.id,
      userId: user.id,
      modelName: "gpt-3.5-turbo",
    };
    const memoryManager = await MemoryManager.getInstance();

    const records = await memoryManager.readLatestHistory(companionKey);
    if (records.length === 0) {
      await memoryManager.seedChatHistory(companion.seed, "\n\n", companionKey);
    }
    await memoryManager.writeToHistory("User: " + prompt + "\n", companionKey);

    // Query Pinecone

    const recentChatHistory =
      await memoryManager.readLatestHistory(companionKey);

    // Right now the preamble is included in the similarity search, but that
    // shouldn't be an issue

    const similarDocs = await memoryManager.vectorSearch(
      recentChatHistory,
      companion_file_name,
    );

    console.log("recentChatHistory", recentChatHistory, similarDocs);

    let relevantHistory = "";
    if (!!similarDocs && similarDocs.length !== 0) {
      relevantHistory = similarDocs.map((doc) => doc.pageContent).join("\n");
    }
    const { handlers } = LangChainStream();

    const openai = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-3.5-turbo",
      callbackManager: CallbackManager.fromHandlers(handlers),
    });

    // Turn verbose on for debugging
    openai.verbose = true;

    const resp = await openai
      .invoke(
        `
        ${companion.instructions}

        Try to give responses that are straight to the point. 
        Below are relevant details about ${companion.name}'s past and the conversation you are in.
        ${relevantHistory}

        ${recentChatHistory}\n${companion.name}:`,
      )
      .catch(console.error);

    const content = resp?.content as string;

    if (!content && content?.length < 1) {
      return new NextResponse("content not found", { status: 404 });
    }

    var Readable = require("stream").Readable;
    let s = new Readable();
    s.push(content);
    s.push(null);

    memoryManager.writeToHistory("" + content, companionKey);

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

    return new StreamingTextResponse(s);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
