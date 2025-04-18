import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider, RedirectToSignIn, SignedOut } from "@clerk/nextjs";
import { GoogleAnalytics } from "@next/third-parties/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ProModal } from "@/components/pro-modal";
import { FeedbackModal } from "@/components/feedback-modal";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Companion.AI",
  description: "Your customized companion.",
};

const googleAnalyticsId = process.env.GOOGLE_ANALYTICS_ID;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider afterSignOutUrl="/sign-in">
      <html lang="en" suppressHydrationWarning>
        <body className={cn("bg-secondary", inter.className)}>
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <FeedbackModal />
            <ProModal />
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
        {googleAnalyticsId && <GoogleAnalytics gaId={googleAnalyticsId} />}
      </html>
    </ClerkProvider>
  );
}
