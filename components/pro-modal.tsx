"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal";
import { Separator } from "@/components/ui/separator";
import {
  MAX_AI_REQUESTS_FREE_COUNTS,
  MAX_CHAT_MESSAGE_LENGTH,
  PRO_MODAL,
} from "@/constants";
import { SubscriptionButton } from "./subscription-button";

export const ProModal = () => {
  const proModal = useModal(PRO_MODAL);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Dialog open={proModal.isOpen} onOpenChange={proModal.onClose}>
      <DialogContent>
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-center">Upgrade to Pro</DialogTitle>
          <div className="space-y-2 text-center">
            <DialogDescription>
              Create
              <span className="mx-1 font-medium text-sky-500">Custom AI</span>
              Companions!
            </DialogDescription>
            <DialogDescription>Send more than {MAX_AI_REQUESTS_FREE_COUNTS} messages</DialogDescription>
            <DialogDescription>
              Send messages longer than {MAX_CHAT_MESSAGE_LENGTH} characters
            </DialogDescription>
          </div>
        </DialogHeader>
        <Separator />
        <div className="flex justify-between">
          <p className="text-2xl font-medium">
            $9<span className="text-sm font-normal">.99 / mo</span>
          </p>
          <SubscriptionButton />
        </div>
      </DialogContent>
    </Dialog>
  );
};
