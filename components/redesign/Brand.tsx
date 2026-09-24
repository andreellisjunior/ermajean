import Link from "next/link";

export default function Brand() {
  return (
    <Link href="/" className="ej-brand" aria-label="ErmaJean home">
      <span>
        ermajean
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <path fill="#B84732" d="M16 9C-2 3 0 30 16 29 32 30 34 3 16 9Z" />
          <path fill="#244638" d="m16 11-9-5 7 1 2-7 2 7 7-1-8 6Z" />
        </svg>
      </span>
      <small>GOOD FOOD. REAL LIFE.</small>
    </Link>
  );
}
