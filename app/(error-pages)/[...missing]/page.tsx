import { notFound } from "next/navigation";

// Route unmatched URLs through this group's branded 404 and root layout.
export default function MissingPage() {
  notFound();
}
