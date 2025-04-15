import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";

import { ChatClient } from "./components/client";

interface PageProps {
  params?: Promise<{
    chatId?: string;
  }>;
}

const Page = async (props: PageProps) => {
  const params = await props.params;
  const { userId, redirectToSignIn } = await auth();

  if (!params?.chatId || !userId) {
    return redirectToSignIn();
  }

  const companion = await prismadb.companion.findUnique({
    where: {
      id: params.chatId,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
        where: {
          userId,
        },
      },
    },
  });

  if (!companion) {
    return redirect("/");
  }

  return <ChatClient companion={companion} />;
};

export default Page;
