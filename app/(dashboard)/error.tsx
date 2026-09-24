"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="ej-workspace" style={{ padding: "12vh 8vw" }}>
      <h1>Let’s try that again.</h1>
      <p>Your kitchen couldn’t load. Your saved recipes are still yours.</p>
      <button className="ej-button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
