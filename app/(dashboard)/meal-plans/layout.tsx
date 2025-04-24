import { ReactNode } from "react";
import { Viewport } from "next";
import { Comfortaa } from "next/font/google";
import Head from "next/head";
import "../../globals.css"; // Ensure global styles are imported
import { CSPostHogProvider } from "@/app/providers"; // Assuming you use this
import BackgroundWrapper from "@/components/ui/BackgroundWrapper"; // Assuming path
import ClientLayout from "@/components/LayoutClient"; // Assuming path for Toaster, Tooltip etc.
import Header from "@/components/Header"; // Assuming standard header path

const comfortaa = Comfortaa({
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#F7F7ED", // Or use CSS variable if defined
  width: "device-width",
  initialScale: 1,
};

// Add appropriate metadata
export const metadata = {
  title: "Meal Planner | ermajean",
  description: "Plan your weekly meals with ermajean.",
};

export default function MealPlansLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${comfortaa.className} scroll-smooth`}
      suppressHydrationWarning
    >
      <Head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      {/* Use bg-background from theme */}
      <body className="bg-background text-foreground">
        <CSPostHogProvider>
           {/* ClientLayout often includes Toaster, Tooltip providers */}
          <ClientLayout>
            {/* Using BackgroundWrapper like in recipes layout */}
            <BackgroundWrapper>
               {/* Include the standard site header */}
               {/* Apply similar padding/max-width as other main sections */}
              <main className="p-4 md:p-6 mx-auto w-full">
                 {children}
              </main>
              {/* Add Footer if applicable */}
            </BackgroundWrapper>
          </ClientLayout>
        </CSPostHogProvider>
      </body>
    </html>
  );
}
