import { MemoryManager } from "@/lib/memory";
import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, props: { params: Promise<{ companionId: string }> }) {
  const params = await props.params;
  try {
    const { userId } = await auth();

    if (!params.companionId) {
      return new NextResponse("Companion ID is required", { status: 400 });
    }

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const memoryManager = await MemoryManager.getInstance();
    const companionKey = {
      companionId: params.companionId,
      userId: userId,
    };
    await memoryManager.clearHistory(companionKey);

    await prismadb.message.deleteMany({
      where: {
        companionId: params.companionId,
        userId: userId,
      },
    });

    return NextResponse.json("Success");
  } catch (error) {
    console.log("[COMPANION_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
