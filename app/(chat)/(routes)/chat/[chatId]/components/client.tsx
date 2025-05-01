"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { Companion, Message } from "@prisma/client";
import { ChatForm } from "./chat-form";
import { ChatHeader } from "./chat-header";
import { ChatMessages } from "./chat-messages";
import { ChatMessageProps } from "./chat-message";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ChatClientProps {
  companion: Companion & {
    messages: Message[];
  };
}

async function fetchStreamedResponse(
  sourceRef: any,
  refresh: () => void,
  companion: Companion,
  prompt: string,
  onChunk: (text: string) => void,
) {
  sourceRef.current = new EventSource(
    `/api/chat/${companion.id}?prompt=${encodeURIComponent(prompt)}`,
  );

  sourceRef.current.onmessage = (event: { data: string }) => {
    const data = JSON.parse(event.data);
    if (data.isChunk) {
      onChunk(data.chunk);
    } else if (data.savedToDB) {
      refresh();
    }
  };

  sourceRef.current.onerror = (err: any) => {
    console.error("SSE error:", err);
    sourceRef.current.close();
  };

  return () => {
    sourceRef.current?.close();
  };
}

export const ChatClient = ({ companion }: ChatClientProps) => {
  const router = useRouter();
  const refresh = () => router.refresh();

  const sourceRef = useRef<EventSource | null>(null);
  useEffect(() => {
    return () => {
      sourceRef.current?.close();
    };
  }, []);

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
      await fetchStreamedResponse(sourceRef, refresh, companion, input, (chunk) => {
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
