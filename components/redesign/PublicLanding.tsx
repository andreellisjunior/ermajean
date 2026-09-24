import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  CookingPot,
  ShoppingBasket,
  Check,
} from "lucide-react";
import config from "@/config";
import Brand from "./Brand";

export default function PublicLanding() {
  return (
    <div className="ej-public">
      <a className="ej-skip" href="#main">
        Skip to content
      </a>
      <header className="ej-header">
        <Brand />
        <nav aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#recipe-box">Your recipe box</a>
          <a href="#pricing">Pricing</a>
        </nav>
        <div className="ej-header-actions">
          <Link href="/sign-in">Sign in</Link>
          <Link className="ej-button ej-green" href="/sign-up">
            Get started free
          </Link>
        </div>
      </header>
      <main id="main">
        <section className="ej-hero">
          <div className="ej-hero-art" aria-hidden="true">
            <Image
              width={1536}
              height={1024}
              priority
              sizes="(max-width: 760px) 100vw, 65vw"
              className="ej-hero-food"
              src="/redesign/chicken-rice.png"
              alt=""
            />
            <div className="ej-hero-fade" />
            <Image
              width={1145}
              height={1374}
              priority
              sizes="(max-width: 760px) 55vw, 35vw"
              className="ej-hero-aunt"
              src="/redesign/ermajean.png"
              alt=""
            />
            <p className="ej-speech">
              We got
              <br />
              food at home.
            </p>
            <div className="ej-ingredient-preview">
              <h3>What are we working with?</h3>
              <div className="ej-preview-input">⌕ &nbsp; Add an ingredient</div>
              <div className="ej-chips">
                <span>Chicken</span>
                <span>Rice</span>
                <span>Spinach</span>
              </div>
            </div>
          </div>
          <div className="ej-hero-copy">
            <h1>
              Dinner shouldn’t
              <br />
              be a <span className="ej-underline">second job.</span>
            </h1>
            <p>
              Good food from what you’ve got.
              <br />A little help from ErmaJean.
            </p>
            <div className="ej-hero-actions">
              <Link href="/sign-up" className="ej-button">
                Find my dinner <ArrowRight size={21} />
              </Link>
              <a href="#how-it-works" className="ej-button ej-outline">
                See how it works
              </a>
            </div>
            <small>Start with 3 free AI recipes.</small>
          </div>
        </section>
        <section id="how-it-works" className="ej-benefits ej-section">
          <div className="ej-section-heading">
            <h2>One less thing to figure out.</h2>
            <p>Simple tools for real life dinners.</p>
          </div>
          <div className="ej-feature-grid">
            <article className="ej-feature">
              <div className="ej-mini-recipe">
                <Image
                  width={360}
                  height={240}
                  sizes="(max-width: 760px) 40vw, 16vw"
                  src="/redesign/chicken-rice.png"
                  alt="Chicken and rice with greens in a skillet"
                />
                <strong>One-pan chicken & rice</strong>
                <small>Example dinner inspiration</small>
                <span className="ej-mini-pill">
                  Tonight, handled. <ArrowRight size={14} />
                </span>
              </div>
              <div>
                <span className="ej-icon">
                  <CookingPot />
                </span>
                <h3>Find tonight’s dinner.</h3>
                <p>
                  Tell us what you have and get simple, delicious recipe ideas.
                </p>
                <Link href="/sign-up">
                  Let’s make dinner <ArrowRight size={18} />
                </Link>
              </div>
            </article>
            <article id="recipe-box" className="ej-feature">
              <div className="ej-mini-recipe ej-mini-saved">
                <Image
                  width={360}
                  height={240}
                  sizes="(max-width: 760px) 40vw, 16vw"
                  src="/redesign/chicken-pasta.png"
                  alt="Lemon garlic chicken pasta inspiration"
                />
                <strong>Lemon garlic chicken pasta</strong>
                <small>Recipe box inspiration</small>
                <span className="ej-mini-pill">
                  ♥ &nbsp; Worth making again
                </span>
              </div>
              <div>
                <span className="ej-icon">
                  <BookOpen />
                </span>
                <h3>Keep the good ones.</h3>
                <p>
                  Save recipes you love and find them anytime in your recipe
                  box.
                </p>
                <Link href="/sign-up">
                  Build your recipe box <ArrowRight size={18} />
                </Link>
              </div>
            </article>
            <article className="ej-feature">
              <div className="ej-mini-plan">
                <h4>This week</h4>
                {[
                  "Mon|Chicken & rice",
                  "Tue|Your favorite bowl",
                  "Wed|Something easy",
                  "Thu|Leftovers night",
                  "Fri|Your choice!",
                ].map((row) => (
                  <div key={row}>
                    <small>{row.split("|")[0]}</small>
                    <span>{row.split("|")[1]}</span>
                  </div>
                ))}
              </div>
              <div>
                <span className="ej-icon">
                  <ShoppingBasket />
                </span>
                <h3>
                  Plan a little.
                  <br />
                  Breathe easier.
                </h3>
                <p>
                  Turn recipes into a grocery list and set up your week (without
                  the overthinking).
                </p>
                <Link href="/sign-up">
                  Make room for dinner <ArrowRight size={18} />
                </Link>
              </div>
            </article>
          </div>
        </section>
        <aside className="ej-tip">
          <Image
            width={95}
            height={95}
            src="/redesign/ermajean-portrait.png"
            alt="ErmaJean"
          />
          <strong>ErmaJean’s tip</strong>
          <div>
            <h2>Flavor first. Fuel, too.</h2>
            <p>
              Real ingredients. Balanced meals. No diet guilt. Just good food
              for real life.
            </p>
          </div>
          <Link href="/sign-up" className="ej-button">
            Get started free <ArrowRight size={20} />
          </Link>
        </aside>
        <section id="pricing" className="ej-pricing ej-section">
          <span className="ej-eyebrow">A LITTLE HELP IN YOUR CORNER</span>
          <h2>Start small. Stay for dinner.</h2>
          <p>Make a little more room in your evening.</p>
          <div className="ej-price-grid">
            {config.stripe.plans.map((plan) => (
              <article
                key={plan.name}
                className={plan.isFeatured ? "ej-price featured" : "ej-price"}
              >
                <span className="ej-eyebrow">
                  {plan.name === "Yearly" ? "YEARLY · BEST VALUE" : plan.name}
                </span>
                <h3>
                  ${plan.price}
                  <small>
                    {plan.name === "Free"
                      ? " to start"
                      : plan.name === "Yearly"
                        ? " / year"
                        : " / month"}
                  </small>
                </h3>
                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature.name}>
                      <Check size={17} />
                      {feature.name}
                    </li>
                  ))}
                </ul>
                <Link
                  className={`ej-button ${plan.isFeatured ? "" : "ej-green"}`}
                  href="/sign-up"
                >
                  {plan.price === 0
                    ? "Get started free"
                    : `Get started with ${plan.name.toLowerCase()}`}
                  <ArrowRight size={18} />
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
      <footer className="ej-footer">
        <Brand />
        <p>Good food. A little less figuring it out.</p>
        <nav aria-label="Footer">
          <Link href="/privacy-policy">Privacy</Link>
          <Link href="/tos">Terms</Link>
          <Link href="/sign-in">Sign in</Link>
        </nav>
      </footer>
    </div>
  );
}
