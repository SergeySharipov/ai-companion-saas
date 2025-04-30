"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import axios from "axios";
import { Companion, Message } from "@prisma/client";
import { useRouter } from "next/navigation";

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

export const ChatClient = ({ companion }: ChatClientProps) => {
  const router = useRouter();
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
      id: "user-" + new Date().toISOString(),
    };

    const systemMessage: ChatMessageProps = {
      role: "system",
      content: "",
      isLoading: true,
      id: "system-" + new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage, systemMessage]);
    setIsLoading(true);

    try {
      const response = await axios.post(`/api/chat/${companion.id}`, {
        prompt: input,
      });
      const text = response.data;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === systemMessage.id
            ? { ...msg, content: text, isLoading: false }
            : msg,
        ),
      );
      setInput("");
      //router.refresh();
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
