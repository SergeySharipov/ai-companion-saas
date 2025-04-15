"use client";

import axios from "axios";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useIsPro } from "@/store/useSubscriptionStore";

export const SubscriptionButton = () => {
  const isPro = useIsPro();
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    if (isPro || process.env.ENABLE_NEW_SUBSCRIPTIONS === "true") {
      try {
        setLoading(true);

        const response = await axios.get("/api/stripe");

        window.location.href = response.data.url;
      } catch (error) {
        toast("Something went wrong");
      } finally {
        setLoading(false);
      }
    } else {
      toast("This application is currently in development, and subscriptions are temporarily disabled. Sorry, for inconvenience.");
    }
  };

  return (
    <Button
      variant={isPro ? "default" : "premium"}
      disabled={loading}
      onClick={onClick}
    >
      {isPro ? "Manage Subscription" : "Subscribe"}
      {!isPro && <Sparkles className="ml-2 h-4 w-4 fill-white" />}
    </Button>
  );
};
