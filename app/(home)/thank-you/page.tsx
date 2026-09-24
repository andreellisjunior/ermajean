import Image from "next/image";
import Link from "next/link";
import Brand from "@/components/redesign/Brand";
export default function ThankYou() {
  return (
    <div className="ej-public">
      <header className="ej-header">
        <Brand />
      </header>
      <main className="ej-completion">
        <Image
          src="/redesign/ermajean-portrait.png"
          alt="ErmaJean"
          width={140}
          height={140}
        />
        <span className="ej-eyebrow">
          A LITTLE INSPIRATION FOR YOUR KITCHEN
        </span>
        <h1>
          Your next dinner idea
          <br />
          is in here somewhere.
        </h1>
        <p>
          Your collection of 24 AI-generated recipes is ready. Save it for the
          evenings when you could use a little help.
        </p>
        <a className="ej-button" href="/24-free-ai-recipes.pdf" download>
          Download the recipes (PDF) ↓
        </a>
        <Link className="ej-button ej-outline" href="/sign-up">
          Start my recipe box →
        </Link>
        <p className="ej-completion-note">
          If you subscribed, check your inbox for a confirmation email.
        </p>
        <Link href="/">Back to ErmaJean</Link>
      </main>
    </div>
  );
}
