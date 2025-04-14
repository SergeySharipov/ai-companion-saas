import { ClientRoot } from "@/app/(root)/components/client-root";
import { checkSubscription } from "@/lib/subscription";

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const isPro = await checkSubscription();

  return <ClientRoot isPro={isPro}>{children}</ClientRoot>;
};

export default RootLayout;
