import { brandFonts } from "@/libs/fonts";
import "../globals.css";
import "@/components/redesign/public.css";
import Brand from "@/components/redesign/Brand";
import { ReactNode } from "react";
import Image from "next/image";
import { createClient } from "@/libs/supabase/server";
import { redirect } from "next/navigation";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

export const metadata = { title: "Welcome to the kitchen | ErmaJean" };
export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const {
    data: { user },
  } = await createClient().auth.getUser();
  if (user) redirect("/kitchen");
  return (
    <html lang="en" className={brandFonts}>
      <body className="ej-auth">
        <header className="ej-auth-header">
          <Brand />
        </header>
        <main className="ej-auth-grid">
          <div className="ej-auth-story">
            <h1>
              Good food.
              <br />A little less figuring it out.
            </h1>
            <p>Your kitchen. Your pace. A little help from ErmaJean.</p>
            <Image
              width={400}
              height={480}
              sizes="400px"
              src="/redesign/ermajean.png"
              alt="ErmaJean, your helpful home cook"
            />
          </div>
          <div className="ej-auth-card">{children}</div>
        </main>
        <ToastContainer />
      </body>
    </html>
  );
}
