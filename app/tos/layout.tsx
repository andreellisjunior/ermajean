import type { ReactNode } from "react";
import type { Viewport } from "next";
import { brandFonts } from "@/libs/fonts";
import SecondaryShell from "@/components/redesign/SecondaryShell";
import "../globals.css";
import "@/components/redesign/public.css";
import "@/components/redesign/secondary.css";

export const metadata = {
  title: "Terms and Conditions | ErmaJean",
  description: "Good food. Real life. A little help from ErmaJean.",
};
export const viewport: Viewport = {
  themeColor: "#f7f3e8",
  width: "device-width",
  initialScale: 1,
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={brandFonts}>
      <body>
        <SecondaryShell>{children}</SecondaryShell>
      </body>
    </html>
  );
}
