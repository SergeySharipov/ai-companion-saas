"use client";

import axios from "axios";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export const SubscriptionButton = ({ isPro = false }: { isPro?: boolean }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    if (!isPro && process.env.ENABLE_NEW_SUBSCRIPTIONS === "true") {
      try {
        setLoading(true);

        const response = await axios.get("/api/stripe");

        window.location.href = response.data.url;
      } catch (error) {
        toast({
          description: "Something went wrong",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    } else {
      toast({
        description:
          "This application is currently in development, and subscriptions are temporarily disabled. Sorry, for inconvenience.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      size="sm"
      variant={isPro ? "default" : "premium"}
      disabled={loading}
      onClick={onClick}
    >
      {isPro ? "Manage Subscription" : "Subscribe"}
      {!isPro && <Sparkles className="ml-2 h-4 w-4 fill-white" />}
    </Button>
  );
};
