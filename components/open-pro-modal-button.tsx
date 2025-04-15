"use client";

import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PRO_MODAL } from "@/constants";
import { useModal } from "@/hooks/use-modal";

export const OpenProModalButton = () => {
  const proModal = useModal(PRO_MODAL);

  return (
    <Button variant="premium" onClick={proModal.onOpen}>
      Upgrade
      <Sparkles className="ml-2 h-4 w-4 fill-white" />
    </Button>
  );
};
