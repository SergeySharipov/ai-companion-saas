"use client";

import { OpenProModalButton } from "@/components/open-pro-modal-button";
import { ResetButton } from "@/components/reset-button";
import { SubscriptionButton } from "@/components/subscription-button";
import { useIsPro } from "@/store/useSubscriptionStore";

export const SettingsForm = () => {
  const isPro = useIsPro();

  return (
    <div className="h-full p-4 space-y-2">
      <h3 className="text-lg font-medium">Settings</h3>
      <div className="text-muted-foreground text-sm">
        {isPro ? "You are currently on a Pro plan." : "You are currently on a free plan."}
      </div>
      {!isPro ? <OpenProModalButton /> : <SubscriptionButton />}
      {process.env.NODE_ENV !== "production" && <ResetButton />}
    </div>
  );
};