"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { useSetIsPro } from "@/store/useSubscriptionStore";
import { Navbar } from "../../../components/navbar";

export const ClientRoot = ({
  children,
  isPro,
}: {
  children: React.ReactNode;
  isPro: boolean;
}) => {
  const setIsPro = useSetIsPro();

  useEffect(() => {
    setIsPro(isPro);
  }, [isPro, setIsPro]);

  return (
    <div className="h-full">
      <Navbar />
      <div className="fixed inset-y-0 mt-16 hidden h-full w-20 flex-col md:flex">
        <Sidebar />
      </div>
      <main className="h-full pt-16 md:pl-20">{children}</main>
    </div>
  );
};
