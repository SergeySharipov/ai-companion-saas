"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Companion, Message } from "@prisma/client";
import { ChatForm } from "./chat-form";
import { ChatHeader } from "./chat-header";
import { ChatMessages } from "./chat-messages";
import { ChatMessageProps } from "./chat-message";
import { toast } from "sonner";

interface ChatClientProps {
  companion: Companion & {
    messages: Message[];
  };
}

async function fetchStreamedResponse(
  companion: Companion,
  prompt: string,
  onChunk: (text: string) => void,
) {
  const response = await fetch(`/api/chat/${companion.id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  const reader = response.body?.getReader();

  if (!reader) return;

  const decoder = new TextDecoder();
  let done = false;

  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;
    if (value) {
      const chunk = decoder.decode(value, { stream: true });
      onChunk(chunk);
    }
  }
}

export const ChatClient = ({ companion }: ChatClientProps) => {
  const [messages, setMessages] = useState<ChatMessageProps[]>(
    companion.messages,
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMessages(companion.messages);
  }, [companion]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessageProps = {
      role: "user",
      content: input,
      id: "new-user-message-" + messages.length,
    };

    const systemMessage: ChatMessageProps = {
      role: "system",
      content: "",
      isLoading: true,
      id: "new-system-message-" + messages.length,
    };

    setMessages((prev) => [...prev, userMessage, systemMessage]);
    setIsLoading(true);

    let accumulatedText = "";

    try {
      await fetchStreamedResponse(companion, input, (chunk) => {
        accumulatedText += chunk;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === systemMessage.id
              ? { ...msg, content: accumulatedText, isLoading: false }
              : msg,
          ),
        );
      });

      setInput("");
    } catch (error: any) {
      setMessages((prev) => prev.filter((msg) => msg.id !== systemMessage.id));

      if (error.status == "402") {
        toast(
          "You exceeded your current quota, please subscribe to chat more.",
        );
      } else {
        toast("An error occurred");
      }
    } finally {
      setIsLoading(false);
    }
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
