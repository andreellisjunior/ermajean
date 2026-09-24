"use client";
import { usePathname } from "next/navigation";
import UpgradeModalProvider from "@/components/providers/UpgradeModalProvider";
export default function WorkspaceProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = usePathname();
  return path.startsWith("/design-preview/") ? (
    <>{children}</>
  ) : (
    <UpgradeModalProvider>{children}</UpgradeModalProvider>
  );
}
