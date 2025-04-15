import { Menu } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Sidebar } from "@/components/sidebar";
import { useState } from "react";

export const MobileSidebar = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="md:hidden">
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="bg-secondary w-32 p-0 pt-10">
        <SheetTitle className="hidden">Menu</SheetTitle>
        <SheetDescription className="hidden">Menu</SheetDescription>
        <Sidebar hideMobileSidebar={() => setOpen(false)}/>
      </SheetContent>
    </Sheet>
  );
};
