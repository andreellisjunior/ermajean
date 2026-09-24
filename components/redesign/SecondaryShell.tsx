import Link from "next/link";
import type { ReactNode } from "react";
import Brand from "./Brand";

export default function SecondaryShell({
  children,
  wide = false,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="ej-public ej-secondary">
      <header className="ej-secondary-header">
        <Brand />
        <Link href="/kitchen" className="ej-secondary-button">
          Find dinner <span aria-hidden="true">→</span>
        </Link>
      </header>
      <main
        id="main-content"
        className={`ej-secondary-main${wide ? " ej-secondary-wide" : ""}`}
      >
        {children}
      </main>
      <footer className="ej-secondary-footer">
        <span>Good food. Real life. You’ve got this.</span>
        <nav aria-label="Legal">
          <Link href="/privacy-policy">Privacy</Link>
          <Link href="/tos">Terms</Link>
          <Link href="/">Home</Link>
        </nav>
      </footer>
    </div>
  );
}
