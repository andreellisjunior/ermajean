import { cache } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/libs/supabase/server";
import type { Recipe } from "@/types/config";

const getSharedRecipe = cache(async (id: string): Promise<Recipe | null> => {
  try {
    const { data, error } = await (await createClient())
      .from("share_recipes")
      .select("*")
      .eq("recipe_id", id)
      .maybeSingle();
    if (error || !data) return null;
    return data as Recipe;
  } catch {
    return null;
  }
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const recipe = await getSharedRecipe((await params).id);
  return {
    title: recipe
      ? `${recipe.recipe_name} | ErmaJean`
      : "Recipe unavailable | ErmaJean",
    description:
      recipe?.description || "A recipe shared from the ErmaJean kitchen.",
  };
}

function lines(value: unknown): string[] {
  return typeof value === "string"
    ? value
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
    : [];
}

export default async function ShareRecipe({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const recipe = await getSharedRecipe((await params).id);
  if (!recipe)
    return (
      <section className="ej-secondary-state">
        <p className="ej-secondary-eyebrow">Shared recipe</p>
        <h1>This recipe isn’t available right now.</h1>
        <p>
          The link may have expired, or we couldn’t load it. Try again in a
          moment, or find your next dinner with ErmaJean.
        </p>
        <div className="ej-secondary-actions">
          <a
            className="ej-secondary-button"
            href={`/recipe/${encodeURIComponent((await params).id)}`}
          >
            Try again
          </a>
          <Link className="ej-secondary-button" href="/kitchen">
            Find dinner →
          </Link>
          <Link className="ej-secondary-button ej-secondary-outline" href="/">
            Back home
          </Link>
        </div>
      </section>
    );

  const facts = [
    ["Prep time", recipe.prep_time],
    ["Cook time", recipe.cook_time],
    ["Total time", recipe.total_time],
    ["Servings", recipe.servings],
    ["Difficulty", recipe.difficulty_level],
    ["Course", recipe.course],
  ];
  const ingredients = lines(recipe.ingredients);
  const instructions = lines(recipe.instructions);
  return (
    <article>
      <div className="ej-secondary-recipe-intro">
        <p className="ej-secondary-eyebrow">From someone’s kitchen to yours</p>
        <h1>{recipe.recipe_name || "Shared recipe"}</h1>
        <p>{recipe.description}</p>
      </div>
      <div className="ej-secondary-recipe-note">
        <svg
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M10 20h28v14a8 8 0 0 1-8 8H18a8 8 0 0 1-8-8V20ZM5 25h5m28 0h5M8 16h32M20 12v-2a4 4 0 0 1 8 0v2M14 7V3m20 4V3" />
        </svg>
        <div>
          <strong>Good food doesn’t need a photoshoot.</strong>
          <p>No photo has been added to this shared recipe.</p>
        </div>
      </div>
      <dl className="ej-secondary-facts">
        {facts.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value || "Not provided"}</dd>
          </div>
        ))}
        {recipe.est_cost && (
          <div>
            <dt>Estimated cost per serving</dt>
            <dd>${recipe.est_cost}</dd>
          </div>
        )}
        {recipe.est_savings && (
          <div>
            <dt>Estimated savings per serving</dt>
            <dd>${recipe.est_savings}</dd>
          </div>
        )}
      </dl>
      <div className="ej-secondary-recipe-columns">
        <section>
          <h2>What you’ll need</h2>
          {ingredients.length ? (
            <ul>
              {ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          ) : (
            <p>No ingredients were included.</p>
          )}
        </section>
        <section>
          <h2>Let’s get cooking.</h2>
          {instructions.length ? (
            <ol>
              {instructions.map((instruction, index) => (
                <li key={index}>{instruction.replace(/^\d+[.)]\s*/, "")}</li>
              ))}
            </ol>
          ) : (
            <p>No instructions were included.</p>
          )}
        </section>
      </div>
    </article>
  );
}
