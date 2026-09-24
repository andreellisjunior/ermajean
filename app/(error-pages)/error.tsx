"use client";
import Link from "next/link";
import Image from "next/image";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="ej-secondary-state" aria-labelledby="error-title">
      <Image
        src="/redesign/ermajean-portrait.png"
        width={112}
        height={112}
        alt=""
        className="ej-secondary-state-image"
      />
      <p className="ej-secondary-eyebrow">A little kitchen hiccup</p>
      <h1 id="error-title">Let’s give that another go.</h1>
      <p>
        Something didn’t load properly. Try again, or head home and we’ll help
        you find your way.
      </p>
      <div className="ej-secondary-actions">
        <button onClick={reset} className="ej-secondary-button">
          Try again
        </button>
        <Link href="/" className="ej-secondary-button ej-secondary-outline">
          Back home
        </Link>
      </div>
    </section>
  );
}
