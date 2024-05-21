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
import { useProModal } from "@/hooks/use-pro-modal";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { MAX_AI_REQUESTS_FREE_COUNTS, MAX_CHAT_MESSAGE_LENGTH } from "@/constants";

export const ProModal = () => {
  const proModal = useProModal();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onSubscribe = async () => {
    toast({
      description:
        "This application is currently in development, and subscriptions are temporarily disabled. Sorry, for inconvenience.",
      variant: "destructive",
    });

    // TODO Add system params to enable Subscriptions
    // try {
    //   setLoading(true);
    //   const response = await axios.get("/api/stripe");

    //   window.location.href = response.data.url;
    // } catch (error) {
    //   toast({
    //     description: "Something went wrong",
    //     variant: "destructive",
    //   });
    // } finally {
    //   setLoading(false);
    // }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <Dialog open={proModal.isOpen} onOpenChange={proModal.onClose}>
      <DialogContent>
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-center">Upgrade to Pro</DialogTitle>
          <DialogDescription className="space-y-2 text-center">
            <p>
              Create
              <span className="mx-1 font-medium text-sky-500">Custom AI</span>
              Companions!
            </p>
            <p>Send more than {MAX_AI_REQUESTS_FREE_COUNTS} messages</p>
            <p>Send messages longer than {MAX_CHAT_MESSAGE_LENGTH} characters</p>
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="flex justify-between">
          <p className="text-2xl font-medium">
            $9<span className="text-sm font-normal">.99 / mo</span>
          </p>
          <Button onClick={onSubscribe} disabled={loading} variant="premium">
            Subscribe
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
