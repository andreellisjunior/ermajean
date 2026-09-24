"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="ej-workspace ej-workspace-state">
      <div>
        <p className="ej-eyebrow">A little kitchen hiccup.</p>
        <h1>Let’s try that again.</h1>
        <p role="alert">
          Your kitchen couldn’t load. Check your connection and give it another
          try.
        </p>
        <button className="ej-button" onClick={reset}>
          Try again
        </button>
      </div>
    </main>
  );
}
