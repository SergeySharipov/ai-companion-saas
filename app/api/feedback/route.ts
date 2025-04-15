import { EmailTemplate } from "@/components/email-template";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const feedbackEmail = process.env.RESEND_FEEDBACK_EMAIL;

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    const user = await currentUser();

    if (!feedbackEmail) {
      return new NextResponse("Feedback email is undefined", { status: 500 });
    }

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: [feedbackEmail],
      subject: "Feedback: ai-companion-saas.vercel.app",
      react: EmailTemplate({
        userId: user.id,
        userEmail: user.emailAddresses[0].emailAddress,
        content: content,
      }),
    });

    if (error) {
      return new NextResponse(error.message, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
