"use client";
import { FormEvent, useId, useState } from "react";
import Link from "next/link";

export default function NewsletterInput() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "pending") return;
    setStatus("pending");
    setMessage("");
    try {
      const response = await fetch("/api/convertkitRequest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error("Unable to subscribe");
      setMessage(
        data.message || "Check your email to confirm your subscription.",
      );
      setStatus("success");
    } catch {
      setMessage(
        "That didn’t go through. Check your connection and try again.",
      );
      setStatus("error");
    }
  }
  return (
    <form
      className="ej-newsletter"
      onSubmit={subscribe}
      aria-busy={status === "pending"}
    >
      {status !== "success" && (
        <>
          <label htmlFor={id}>Email address</label>
          <div className="ej-newsletter-fields">
            <input
              id={id}
              type="email"
              autoComplete="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={status === "pending"}
              aria-describedby={`${id}-message`}
            />
            <button
              type="submit"
              className="ej-button"
              disabled={status === "pending"}
            >
              {status === "pending"
                ? "Sending…"
                : status === "error"
                  ? "Try again"
                  : "Send me the recipes"}
            </button>
          </div>
        </>
      )}
      <p
        id={`${id}-message`}
        role={status === "error" ? "alert" : "status"}
        className={status === "error" ? "ej-form-error" : "ej-form-status"}
      >
        {message}
      </p>
      <small>
        Subscribe for the recipe collection and cooking inspiration. Unsubscribe
        anytime. <Link href="/privacy-policy">Privacy policy</Link>
      </small>
      {status === "success" && (
        <Link href="/thank-you" className="ej-button ej-green">
          Get the recipe collection →
        </Link>
      )}
    </form>
  );
}
