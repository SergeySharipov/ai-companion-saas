import { MemoryManager } from "@/lib/memory";
import prismadb from "@/lib/prismadb";
import { currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { companionId: string } },
) {
  try {
    const user = await currentUser();

    if (!params.companionId) {
      return new NextResponse("Companion ID is required", { status: 400 });
    }

    if (!user || !user.id || !user.firstName) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const memoryManager = await MemoryManager.getInstance();
    const companionKey = {
      companionId: params.companionId,
      userId: user.id,
      modelName: "gpt-3.5-turbo",
    };
    await memoryManager.clearHistory(companionKey);

    await prismadb.message.deleteMany({
      where: {
        companionId: params.companionId,
        userId: user.id,
      },
    });

    return NextResponse.json("Success");
  } catch (error) {
    console.log("[COMPANION_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
