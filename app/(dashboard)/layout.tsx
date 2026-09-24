import { ReactNode } from "react";
import { brandFonts } from "@/libs/fonts";
import WorkspaceProviders from "@/components/redesign/WorkspaceProviders";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../globals.css";
import "@/components/redesign/workspace.css";
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={brandFonts}>
      <body>
        <WorkspaceProviders>
          {children}
          <ToastContainer />
        </WorkspaceProviders>
      </body>
    </html>
  );
}
