"use client";

import { BotAvatar } from "@/components/bot-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { Companion, Message } from "@prisma/client";
import axios from "axios";
import {
  ChevronLeft,
  Edit,
  History,
  MessageSquare,
  MoreVertical,
  Trash,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ChatHeaderProps {
  companion: Companion & {
    messages: Message[];
  };
}

export const ChatHeader = ({ companion }: ChatHeaderProps) => {
  const router = useRouter();
  const { user } = useUser();

  const onDelete = async () => {
    try {
      await axios.delete(`/api/companion/${companion.id}`);

      toast("Success.");

      router.refresh();
      router.push("/");
    } catch (error) {
      toast("Something went wrong.");
    }
  };

  const onClearMessageHistory = async () => {
    try {
      await axios.delete(`/api/companion/${companion.id}/history`);

      toast("Success.");

      router.refresh();
    } catch (error) {
      toast("Something went wrong.");
    }
  };

  return (
    <div className="border-primary/10 flex w-full items-center justify-between border-b pb-4">
      <div className="flex items-center gap-x-2">
        <Button size="icon" variant="ghost" onClick={() => router.back()}>
          <ChevronLeft className="h-8 w-8" />
        </Button>
        <BotAvatar src={companion.src} />
        <div className="flex flex-col gap-y-1">
          <div className="flex items-center gap-x-2">
            <p className="font-bold">{companion.name}</p>
            <div className="text-muted-foreground flex items-center text-xs">
              <MessageSquare className="mr-1 h-3 w-3" />
              {companion.messages.length}
            </div>
          </div>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger className="p-4 outline-hidden">
          <MoreVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onClearMessageHistory}>
            <History className="mr-2 h-4 w-4" />
            Clear Message History
          </DropdownMenuItem>
          {user?.id === companion.userId && (
            <>
              <DropdownMenuItem
                onClick={() => router.push(`/companion/${companion.id}`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>

              <DropdownMenuItem onClick={onDelete}>
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
