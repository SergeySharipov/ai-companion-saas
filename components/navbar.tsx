"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Poppins } from "next/font/google";

import { cn } from "@/lib/utils";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal";
import { FEEDBACK_MODAL } from "@/constants";
import { useIsPro } from "@/store/useSubscriptionStore";
import { OpenProModalButton } from "@/components/open-pro-modal-button";

const font = Poppins({ weight: "600", subsets: ["latin"] });

export const Navbar = () => {
  const isPro = useIsPro();
  const feedbackModal = useModal(FEEDBACK_MODAL);

  return (
    <div className="fixed z-50 flex h-16 w-full items-center justify-between border-b border-primary/10 bg-secondary px-4 py-2">
      <div className="flex items-center">
        <MobileSidebar />
        <Link href="/">
          <h1
            className={cn(
              "hidden text-xl font-bold text-primary md:block md:text-3xl",
              font.className,
            )}
          >
            companion.ai
          </h1>
        </Link>
      </div>
      <div className="flex items-center gap-x-3">
        <Button onClick={feedbackModal.onOpen} size="sm">
          Feedback
        </Button>
        {!isPro && <OpenProModalButton />}
        <ModeToggle />
        <UserButton afterSignOutUrl="/sign-in" />
      </div>
    </div>
  );
};
