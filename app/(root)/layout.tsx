import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="h-full">
      <Navbar />
      <div className="fixed inset-y-0 mt-16 hidden w-20 flex-col md:flex">
        <Sidebar />
      </div>
      <main className="h-full pt-16 md:pl-20">{children}</main>
    </div>
  );
};

export default Layout;
