import { EmailTemplate } from "@/components/email-template";
import { NextResponse } from "next/server";
import { resetAiRequestsCount } from "@/lib/user-settings";

export async function POST(request: Request) {
  try {
    await resetAiRequestsCount();

    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
