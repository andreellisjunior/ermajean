import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <section className="ej-secondary-state" aria-labelledby="not-found-title">
      <Image
        src="/redesign/ermajean-portrait.png"
        width={112}
        height={112}
        alt=""
        className="ej-secondary-state-image"
      />
      <p className="ej-secondary-eyebrow">404 · Page not found</p>
      <h1 id="not-found-title">This one’s not in the recipe box.</h1>
      <p>
        The page may have moved, or the link might be a little off. Let’s get
        you back to something good.
      </p>
      <div className="ej-secondary-actions">
        <Link href="/" className="ej-secondary-button">
          Back home <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
