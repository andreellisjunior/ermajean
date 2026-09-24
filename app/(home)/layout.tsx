import { CSPostHogProvider } from "@/app/providers";
import { brandFonts } from "@/libs/fonts";
import { ReactNode } from "react";
import "../globals.css";
import "@/components/redesign/public.css";

export const viewport = {
  themeColor: "#F7F3E8",
  width: "device-width",
  initialScale: 1,
};
export const metadata = {
  title: "ErmaJean — Good food. Real life.",
  description:
    "Dinner shouldn’t be a second job. Turn what you have into dinner, save your keepers, and plan your week with ErmaJean.",
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={brandFonts}>
      <body>
        <CSPostHogProvider>{children}</CSPostHogProvider>
      </body>
    </html>
  );
}
