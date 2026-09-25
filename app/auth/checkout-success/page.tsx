"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
function Content() {
  const params = useSearchParams(),
    router = useRouter();
  const id = params.get("session_id");
  const [state, setState] = useState<"loading" | "pending" | "ready" | "error">(
    "loading",
  );
  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    async function check() {
      if (!id) {
        setState("error");
        return;
      }
      try {
        const response = await fetch(
          `/api/stripe/session-details?session_id=${encodeURIComponent(id)}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error();
        const result = await response.json();
        if (result.complete && result.has_access) {
          setState("ready");
          timer = setTimeout(() => router.push("/recipes"), 2000);
        } else setState("pending");
      } catch {
        if (!controller.signal.aborted) setState("error");
      }
    }
    check();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [id, router]);
  return (
    <section className="ej-secondary-state" aria-live="polite">
      <p className="ej-secondary-eyebrow">Your ErmaJean account</p>
      <h1>
        {state === "ready"
          ? "Dinner just got easier."
          : state === "pending"
            ? "We’re confirming your access."
            : state === "error"
              ? "Let’s check your account."
              : "Checking your checkout…"}
      </h1>
      <p>
        {state === "ready"
          ? "Your subscription is active. Taking you to your recipes."
          : state === "pending"
            ? "Checkout is still being confirmed. Your account will update when confirmation arrives."
            : state === "error"
              ? "We couldn’t confirm this checkout. Sign in to the account you used, or check your account before trying another payment."
              : "Just a moment while we check your account."}
      </p>
      <div className="ej-secondary-actions">
        <Link
          className="ej-secondary-button"
          href={state === "error" ? "/sign-in" : "/recipes"}
        >
          {state === "error" ? "Sign in" : "Go to recipes"}
        </Link>
        {state === "pending" && (
          <button
            className="ej-secondary-button ej-secondary-outline"
            onClick={() => window.location.reload()}
          >
            Check again
          </button>
        )}
      </div>
    </section>
  );
}
export default function CheckoutSuccess() {
  return (
    <Suspense fallback={<p role="status">Checking your checkout…</p>}>
      <Content />
    </Suspense>
  );
}
