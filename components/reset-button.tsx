"use client";

import { Button } from "@/components/ui/button";
import { resetAiRequestsCount } from "@/lib/user-settings";

export const ResetButton = () => {
  const handleReset = async () => {
    try {
      const res = await fetch("/api/settings/reset", {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to send");
    } catch (err) {
      
    }
  };

  return (
    <Button
      onClick={handleReset}
      className="text-sm text-red-600 underline"
    >
      Reset
    </Button>
  );
};
