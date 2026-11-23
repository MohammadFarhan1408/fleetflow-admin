import type { Metadata } from "next";
import { IBM_Plex_Mono, Nunito_Sans } from "next/font/google";
import Script from "next/script";

import { TooltipProvider } from "@/components/ui/tooltip";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "FleetFlow Admin",
};

const RootLayout = ({ children }: LayoutProps<"/">) => {
  return (
    // The theme script sets data-theme on <html> before hydration.
    <html lang="en" className={`${nunitoSans.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh">
        <TooltipProvider>{children}</TooltipProvider>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
      </body>
    </html>
  );
};

export default RootLayout;
