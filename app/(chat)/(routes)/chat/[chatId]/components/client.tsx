"use client";

import { useCompletion } from "ai/react";
import { FormEvent, useEffect, useState } from "react";
import { Companion, Message } from "@prisma/client";
import { useRouter } from "next/navigation";

import { ChatForm } from "./chat-form";
import { ChatHeader } from "./chat-header";
import { ChatMessages } from "./chat-messages";
import { ChatMessageProps } from "./chat-message";

interface ChatClientProps {
  companion: Companion & {
    messages: Message[];
  };
}

export const ChatClient = ({ companion }: ChatClientProps) => {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessageProps[]>(
    companion.messages,
  );

  useEffect(() => {
    setMessages(companion.messages);
  }, [companion, setMessages]);

  const { input, isLoading, handleInputChange, handleSubmit, setInput } =
    useCompletion({
      api: `/api/chat/${companion.id}`,
      onFinish(prompt, completion) {
        setInput("");

        router.refresh();
      },
    });

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    const userMessage: ChatMessageProps = {
      role: "user",
      content: input,
      id: "user" + new Date().toISOString(),
    };
    const systemMessage: ChatMessageProps = {
      role: "system",
      isLoading: true,
      id: "system" + new Date().toISOString(),
    };
    setMessages((current) => [...current, userMessage, systemMessage]);

    handleSubmit(e);
  };

  return (
    <div className="flex h-full flex-col space-y-2 p-4">
      <ChatHeader companion={companion} />
      <ChatMessages
        companion={companion}
        isLoading={isLoading}
        messages={messages}
      />
      <ChatForm
        isLoading={isLoading}
        input={input}
        handleInputChange={handleInputChange}
        onSubmit={onSubmit}
      />
    </div>
  );
};
