import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { checkSubscription } from "@/lib/subscription";

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const isPro = await checkSubscription();

  return (
    <div className="h-full">
      <Navbar isPro={isPro} />
      <div className="fixed inset-y-0 mt-16 hidden h-full w-20 flex-col md:flex">
        <Sidebar isPro={isPro} />
      </div>
      <main className="h-full pt-16 md:pl-20">{children}</main>
    </div>
  );
};

export default RootLayout;
