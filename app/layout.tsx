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

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

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
    <html lang="en" suppressHydrationWarning>
      <body className={cn("bg-secondary", inter.className)}>
        <ClerkProvider afterSignOutUrl="/sign-in">
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <FeedbackModal />
            <ProModal />
            {children}
            <Toaster />
          </ThemeProvider>
        </ClerkProvider>
        {googleAnalyticsId && <GoogleAnalytics gaId={googleAnalyticsId} />}
      </body>
    </html>
  );
}
