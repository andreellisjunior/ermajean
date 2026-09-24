import Image from "next/image";
import NewsletterInput from "@/components/NewsletterInput";
import Brand from "@/components/redesign/Brand";
import Link from "next/link";
import cover from "@/app/assets/marketing-material/PDF - page 1.jpg";

export const metadata = {
  title: "24 free recipe ideas | ErmaJean",
  description:
    "A little dinner inspiration: 24 AI-generated recipes, including traditional, gluten-free and vegan options.",
};
export default function FreeRecipes() {
  return (
    <div className="ej-public">
      <header className="ej-header">
        <Brand />
        <Link href="/sign-in">Sign in</Link>
      </header>
      <main className="ej-free-recipes">
        <div>
          <span className="ej-eyebrow">A LITTLE INSPIRATION, ON US</span>
          <h1>
            Fresh ideas.
            <br />
            Less dinner indecision.
          </h1>
          <p>
            Get 24 AI-generated recipes for breakfast, lunch, dinner, and the
            sweet stuff. Traditional, gluten-free and vegan ideas to make your
            own.
          </p>
          <NewsletterInput />
          <aside className="ej-download-tip">
            <Image
              src="/redesign/ermajean-portrait.png"
              width={64}
              height={64}
              alt=""
            />
            <p>
              <strong>ErmaJean’s tip</strong>
              <br />
              Read the recipe first, check what you’ve got, and make the swaps
              that work for you.
            </p>
          </aside>
        </div>
        <figure>
          <Image
            src={cover}
            alt="Cover of the 24 free recipes collection"
            priority
            sizes="(max-width:760px) 80vw, 400px"
          />
          <figcaption>
            A little help for your next “what’s for dinner?”
          </figcaption>
        </figure>
      </main>
      <footer className="ej-footer">
        <Link href="/">Back to ErmaJean</Link>
        <nav aria-label="Footer">
          <Link href="/privacy-policy">Privacy</Link>
          <Link href="/tos">Terms</Link>
        </nav>
      </footer>
    </div>
  );
}
