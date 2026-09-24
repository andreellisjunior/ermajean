"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChefHat,
  Clock,
  Home,
  Minus,
  Plus,
  Search,
  Settings,
  ShoppingBasket,
  Users,
  Printer,
  X,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { addAIRecipeAction } from "@/app/actions";
import { createClient } from "@/libs/supabase/client";
import ProfileSettings from "@/components/ProfileSettings";
import EditRecipe from "@/components/EditRecipe";
import AddNewRecipe from "@/components/ui/AddNewRecipe";
import RecipeSettings from "@/components/ui/RecipeSettings";
import RecipeNotes from "@/components/RecipeNotes";
import Modal from "@/components/ui/Modal";
import { DialogTitle } from "@headlessui/react";
import type { WorkspaceData, Meal } from "./workspace-data";
import type { Recipe } from "@/types";
import { addDays, format, startOfWeek } from "date-fns";

type View = "kitchen" | "recipes" | "recipe" | "plan" | "shop";
const routes = {
  kitchen: "/kitchen",
  recipes: "/recipes",
  plan: "/meal-plans",
  shop: "/shop",
};
const lines = (value: string) => {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {}
  return (value || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
};
function SubmitDinner() {
  const { pending } = useFormStatus();
  return (
    <button className="ej-button" disabled={pending}>
      {pending ? "Working on dinner…" : "Find my dinner"}{" "}
      <ArrowRight size={20} />
    </button>
  );
}
function Food({
  recipe,
  preview = false,
}: {
  recipe: Recipe;
  preview?: boolean;
}) {
  return preview ? (
    <Image
      className="ej-food"
      width={1024}
      height={768}
      sizes="(max-width: 700px) 100vw, 50vw"
      src={`/redesign/${recipe.id === "demo-pasta" ? "chicken-pasta" : recipe.id === "demo-bowl" ? "chickpea-bowl" : "chicken-rice"}.png`}
      alt={recipe.recipe_name}
    />
  ) : (
    <div className="ej-food ej-food-placeholder">
      <ChefHat size={48} strokeWidth={1} />
      <span>{recipe.course || "From your kitchen"}</span>
      <small>Recipe photo not added</small>
    </div>
  );
}
export default function Workspace({
  view,
  data,
  recipeId,
}: {
  view: View;
  data: WorkspaceData;
  recipeId?: string;
}) {
  const router = useRouter();
  const preview = !!data.preview;
  const [search, setSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [help, setHelp] = useState(false);
  const [ingredient, setIngredient] = useState("");
  const [ingredients, setIngredients] = useState<string[]>(
    preview ? ["Chicken", "Rice", "Spinach"] : [],
  );
  const [time, setTime] = useState("20 min");
  const [servings, setServings] = useState(4);
  const [draftReady, setDraftReady] = useState(false);
  const [week, setWeek] = useState(() =>
    startOfWeek(preview ? new Date(2026, 8, 21) : new Date(), {
      weekStartsOn: 1,
    }),
  );
  const [meals, setMeals] = useState(data.meals);
  const [mealType, setMealType] = useState("Dinner");
  const [slot, setSlot] = useState<string | null>(null);
  const [choice, setChoice] = useState("");
  const [moveId, setMoveId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [checked, setChecked] = useState<string[]>([]);
  const [tab, setTab] = useState("Ingredients");
  const [cook, setCook] = useState(false);
  const [step, setStep] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [, setLegacyOpen] = useState(false);
  useEffect(() => {
    if (!preview) {
      try {
        const saved = JSON.parse(
          sessionStorage.getItem(`ej-dinner-${data.userId}`) || "null",
        );
        if (saved) {
          setIngredients(saved.ingredients || []);
          setTime(saved.time || "20 min");
          setServings(saved.servings || 4);
        }
      } catch {}
    }
    setDraftReady(true);
  }, [preview, data.userId]);
  useEffect(() => {
    if (draftReady && !preview)
      try {
        sessionStorage.setItem(
          `ej-dinner-${data.userId}`,
          JSON.stringify({ ingredients, time, servings }),
        );
      } catch {}
  }, [ingredients, time, servings, draftReady, preview, data.userId]);
  useEffect(() => setMeals(data.meals), [data.meals]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearch(params.get("q") || "");
    setMessage(params.get("error") || params.get("success") || "");
  }, [view]);
  const href = (v: keyof typeof routes) =>
    preview ? `/design-preview/${v}` : routes[v];
  const detail = (r: Recipe) =>
    preview ? "/design-preview/recipe" : `/recipes/${r.id}`;
  const filtered = data.recipes.filter((r) =>
    r.recipe_name.toLowerCase().includes(search.toLowerCase()),
  );
  const recipe = data.recipes.find((r) => r.id === recipeId) || data.recipes[0];
  const days = Array.from({ length: 7 }, (_, i) => addDays(week, i));
  const end = format(days[6], "yyyy-MM-dd");
  const start = format(week, "yyyy-MM-dd");
  const weekMeals = meals.filter((m) => m.date >= start && m.date <= end);
  const shopping = weekMeals.flatMap((m) => {
    const r = data.recipes.find((r) => r.id === m.recipe_id);
    return r
      ? lines(r.ingredients).map((text, i) => ({
          key: `${m.id}-${i}`,
          text,
          recipe: r.recipe_name,
        }))
      : [];
  });
  const addIngredient = () => {
    const value = ingredient.trim();
    if (value && !ingredients.includes(value)) {
      setIngredients([...ingredients, value]);
      setIngredient("");
    }
  };
  async function saveMeal() {
    if (!slot || !choice) return;
    setBusy(true);
    setMessage("");
    try {
      if (preview) {
        setMeals((old) => [
          ...old.filter(
            (m) =>
              m.id !== moveId && !(m.date === slot && m.meal_type === mealType),
          ),
          {
            id: `demo-${Date.now()}`,
            date: slot,
            meal_type: mealType,
            recipe_id: choice,
          },
        ]);
      } else {
        const db = createClient();
        const existing = meals.find(
          (m) => m.date === slot && m.meal_type === mealType,
        );
        if (moveId && existing && existing.id !== moveId)
          throw new Error(
            "Choose an empty slot to move this meal. Use Swap to replace a planned recipe.",
          );
        const payload = {
          user_id: data.userId,
          date: slot,
          meal_type: mealType,
          recipe_id: choice,
        };
        const result =
          moveId || existing
            ? await db
                .from("meal_plans")
                .update(payload)
                .eq("id", moveId || existing!.id)
                .eq("user_id", data.userId)
                .select()
                .single()
            : await db.from("meal_plans").insert(payload).select().single();
        if (result.error) throw result.error;
        setMeals((old) => [
          ...old.filter((m) => m.id !== (moveId || existing?.id)),
          result.data,
        ]);
        router.refresh();
      }
      setSlot(null);
      setMoveId(null);
      setChecked([]);
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "Could not save this meal. Your plan is unchanged.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function removeMeal(m: Meal) {
    setBusy(true);
    setMessage("");
    try {
      if (!preview) {
        const { error } = await createClient()
          .from("meal_plans")
          .delete()
          .eq("id", m.id)
          .eq("user_id", data.userId);
        if (error) throw error;
      }
      setMeals((old) => old.filter((x) => x.id !== m.id));
      setChecked([]);
      if (!preview) router.refresh();
    } catch {
      setMessage("Could not remove this meal. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  const openSlot = (date: string, r?: string, move?: string) => {
    setSlot(date);
    setChoice(r || data.recipes[0]?.id || "");
    setMoveId(move || null);
    setMessage("");
  };
  const toggle = (key: string) =>
    setChecked((old) =>
      old.includes(key) ? old.filter((v) => v !== key) : [...old, key],
    );
  const shoppingPane = (
    <aside className="ej-shopping ej-panel">
      <h2>
        Your list<span className="ej-spark">〃</span>
      </h2>
      <p>From this week’s plan.</p>
      <div className="ej-list-origin">
        {format(week, "MMM d")}–{format(days[6], "MMM d")} · {weekMeals.length}{" "}
        planned meals
      </div>
      <h3 className="ej-list-label">Ingredients to check</h3>
      <p className="ej-muted ej-small">
        Original quantities, listed per meal. Check your pantry first.
      </p>
      {shopping.length ? (
        shopping.map((item) => (
          <label className="ej-check" key={item.key}>
            <input
              type="checkbox"
              checked={checked.includes(item.key)}
              onChange={() => toggle(item.key)}
            />
            <span>
              {item.text}
              <small>{item.recipe}</small>
            </span>
          </label>
        ))
      ) : (
        <p className="ej-empty">
          Add a meal to your plan and its ingredients will appear here.
        </p>
      )}
      <button className="ej-button" onClick={() => window.print()}>
        <Printer size={19} /> Print list
      </button>
      <div className="ej-tip">
        <Image
          width={176}
          height={176}
          src="/redesign/ermajean-portrait.png"
          alt=""
        />
        <div>
          <strong>ErmaJean’s tip</strong>
          <p>Make extra tonight. Tomorrow-you says thanks.</p>
        </div>
      </div>
    </aside>
  );
  return (
    <div className="ej-workspace">
      <a className="ej-skip" href="#kitchen-main">
        Skip to content
      </a>
      <aside className="ej-sidebar">
        <Link className="ej-wordmark" href={href("kitchen")}>
          ermajean<span>🍅</span>
          <small>GOOD FOOD. REAL LIFE.</small>
        </Link>
        <nav aria-label="Kitchen navigation">
          {(
            [
              ["kitchen", "Kitchen", Home],
              ["recipes", "Recipes", BookOpen],
              ["plan", "Plan", CalendarDays],
              ["shop", "Shop", ShoppingBasket],
            ] as const
          ).map(([key, label, Icon]) => (
            <Link
              key={key}
              href={href(key)}
              aria-current={
                view === key || (view === "recipe" && key === "recipes")
                  ? "page"
                  : undefined
              }
            >
              <Icon size={24} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="ej-sidebar-secondary">
          <button onClick={() => setHelp(true)}>
            <HelpCircle size={23} />
            Help
          </button>
          <button onClick={() => setProfileOpen(true)}>
            <Settings size={23} />
            Settings
          </button>
        </div>
        <p className="ej-sidebar-note">
          Dinner feels
          <br />
          better together.<span>⌁</span>
        </p>
      </aside>
      <main id="kitchen-main" className="ej-main">
        {preview && (
          <div className="ej-preview">
            Design preview · Sample recipes and meals. Changes stay in this
            preview.
          </div>
        )}
        <header className="ej-topbar">
          <form
            className="ej-search"
            onSubmit={(e) => {
              e.preventDefault();
              if (view !== "recipes")
                router.push(
                  `${href("recipes")}?q=${encodeURIComponent(search)}`,
                );
            }}
          >
            <Search size={22} />
            <input
              aria-label="Search your recipes"
              placeholder="Search your recipes"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
          <button
            className="ej-account"
            aria-label="Open profile settings"
            onClick={() => setProfileOpen(true)}
          >
            {data.profile.name?.[0] || "Y"}
          </button>
        </header>
        {data.error && (
          <p role="alert" className="ej-error">
            {data.error}
          </p>
        )}
        {message && (
          <p role="status" className="ej-error">
            {message}
          </p>
        )}
        {view === "kitchen" && (
          <>
            <section className="ej-kitchen-hero">
              <div className="ej-heading">
                <h1>
                  Hey, what’s for dinner?<span className="ej-spark">〃</span>
                </h1>
                <p>Let’s work with what you’ve got.</p>
              </div>
              <form
                action={
                  preview
                    ? () =>
                        setMessage(
                          "Preview only. Sign in to generate your own dinner.",
                        )
                    : addAIRecipeAction
                }
                className="ej-ingredient-panel"
              >
                <div className="ej-ingredient-controls">
                  <h2>What are we working with?</h2>
                  <div className="ej-ingredient-entry">
                    <Search size={20} />
                    <input
                      aria-label="Add an ingredient"
                      placeholder="Add an ingredient"
                      value={ingredient}
                      onChange={(e) => setIngredient(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addIngredient();
                        }
                      }}
                    />
                    <button
                      type="button"
                      aria-label="Add ingredient"
                      onClick={addIngredient}
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  <div className="ej-chips">
                    {ingredients.map((item) => (
                      <button
                        type="button"
                        key={item}
                        onClick={() =>
                          setIngredients(ingredients.filter((i) => i !== item))
                        }
                      >
                        {item}
                        <X size={14} />
                        <span className="sr-only">Remove</span>
                      </button>
                    ))}
                  </div>
                  <input
                    type="hidden"
                    name="ingredients"
                    value={ingredients.join(", ")}
                  />
                  <input
                    type="hidden"
                    name="taste"
                    value="A satisfying, practical dinner using these ingredients"
                  />
                  <input type="hidden" name="totalTime" value={time} />
                  <input type="hidden" name="serving" value={servings} />
                  <input type="hidden" name="course" value="Dinner" />
                  <input
                    type="hidden"
                    name="location"
                    value={data.profile.location || "USA"}
                  />
                  <div className="ej-dinner-options">
                    <fieldset>
                      <legend>Time</legend>
                      <div className="ej-segment">
                        {["15 min", "20 min", "30 min"].map((t) => (
                          <button
                            type="button"
                            key={t}
                            aria-pressed={time === t}
                            onClick={() => setTime(t)}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                    <fieldset>
                      <legend>Servings</legend>
                      <div className="ej-stepper">
                        <button
                          type="button"
                          aria-label="Fewer servings"
                          disabled={servings <= 1}
                          onClick={() => setServings(servings - 1)}
                        >
                          <Minus size={16} />
                        </button>
                        <span>{servings}</span>
                        <button
                          type="button"
                          aria-label="More servings"
                          disabled={servings >= 12}
                          onClick={() => setServings(servings + 1)}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </fieldset>
                    <SubmitDinner />
                  </div>
                </div>
                <Image
                  className="ej-mascot"
                  width={480}
                  height={600}
                  priority
                  src="/redesign/ermajean.png"
                  alt="ErmaJean, your kitchen companion"
                />
              </form>
            </section>
            <div className="ej-kitchen-columns">
              <section>
                <h2 className="ej-underlined">Tonight, handled.</h2>
                {recipe ? (
                  <Link className="ej-featured ej-panel" href={detail(recipe)}>
                    <Food recipe={recipe} preview={preview} />
                    <div>
                      <h3>{recipe.recipe_name}</h3>
                      <p>{recipe.description}</p>
                      <p className="ej-meta">
                        {recipe.total_time} · Serves {recipe.servings}
                      </p>
                      <span className="ej-button">
                        See recipe <ArrowRight size={19} />
                      </span>
                    </div>
                  </Link>
                ) : (
                  <div className="ej-panel ej-empty">
                    <ChefHat size={38} />
                    <h3>A good dinner starts here.</h3>
                    <p>
                      Add what’s in your fridge above, or save a recipe you
                      already love.
                    </p>
                    <Link href={href("recipes")} className="ej-button">
                      Open recipe box <ArrowRight size={18} />
                    </Link>
                  </div>
                )}
              </section>
              <section className="ej-panel ej-week-summary">
                <div className="ej-section-title">
                  <h2>This week, loosely.</h2>
                  <Link href={href("plan")}>View plan →</Link>
                </div>
                {days.slice(0, 3).map((day) => {
                  const date = format(day, "yyyy-MM-dd");
                  const m = meals.find(
                    (m) => m.date === date && m.meal_type === "Dinner",
                  );
                  const r = data.recipes.find((r) => r.id === m?.recipe_id);
                  return (
                    <Link
                      className="ej-mini-meal"
                      href={r ? detail(r) : href("plan")}
                      key={date}
                    >
                      <span>{format(day, "EEE")}</span>
                      <div>
                        <h3>{r?.recipe_name || "Add dinner"}</h3>
                        <p>
                          {r
                            ? `${r.total_time} · Serves ${r.servings}`
                            : "Let’s figure it out together."}
                        </p>
                      </div>
                      <ChevronRight size={19} />
                    </Link>
                  );
                })}
              </section>
            </div>
            <div className="ej-section-title">
              <h2 className="ej-underlined">Your keepers.</h2>
              <Link href={href("recipes")}>See all recipes →</Link>
            </div>
            <div className="ej-keepers">
              {data.recipes.slice(0, 3).map((r) => (
                <Link
                  className="ej-keeper ej-panel"
                  key={r.id}
                  href={detail(r)}
                >
                  <Food recipe={r} preview={preview} />
                  <div>
                    <h3>{r.recipe_name}</h3>
                    <p>
                      {r.total_time} · Serves {r.servings}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
        {view === "recipes" && (
          <>
            <div className="ej-heading">
              <h1>
                Your recipe box.<span className="ej-spark">〃</span>
              </h1>
              <p>The good ones? Keep ’em close.</p>
            </div>
            <div className="ej-section-title">
              <p>{filtered.length} saved recipes</p>
              {
                <div className="ej-add-recipe">
                  <AddNewRecipe
                    preview={preview}
                    profiles={[data.profile]}
                    count={data.usageCount || 0}
                    searchParams={{ message: "" }}
                  />
                </div>
              }
            </div>
            <div className="ej-recipe-grid">
              {filtered.map((r) => (
                <Link
                  className="ej-recipe-card ej-panel"
                  href={detail(r)}
                  key={r.id}
                >
                  <Food recipe={r} preview={preview} />
                  <div>
                    <span className="ej-eyebrow">{r.course}</span>
                    <h2>{r.recipe_name}</h2>
                    <p>{r.description}</p>
                    <p className="ej-meta">
                      <Clock size={16} />
                      {r.total_time} · Serves {r.servings}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            {!filtered.length && (
              <div className="ej-empty ej-panel">
                <BookOpen size={40} />
                <h2>
                  {search
                    ? "No keepers found."
                    : "Make room for your favorites."}
                </h2>
                <p>
                  {search
                    ? "Try another recipe name."
                    : "Add your first recipe with Add recipe. Your future self will thank you."}
                </p>
              </div>
            )}
          </>
        )}
        {view === "recipe" && recipe && (
          <>
            <Link className="ej-back" href={href("recipes")}>
              <ChevronLeft size={20} />
              Recipe box
            </Link>
            <div className="ej-recipe-detail">
              <section>
                <Food recipe={recipe} preview={preview} />
                <div className="ej-tabs" role="tablist">
                  {["Ingredients", "Steps", "Notes"].map((t) => (
                    <button
                      role="tab"
                      aria-selected={tab === t}
                      key={t}
                      onClick={() => setTab(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div role="tabpanel">
                  <h2>{tab}</h2>
                  {tab === "Ingredients" ? (
                    lines(recipe.ingredients).map((text, i) => (
                      <label className="ej-check" key={i}>
                        <input
                          type="checkbox"
                          checked={checked.includes(`ingredient-${i}`)}
                          onChange={() => toggle(`ingredient-${i}`)}
                        />
                        <span>{text}</span>
                      </label>
                    ))
                  ) : tab === "Steps" ? (
                    <ol className="ej-steps">
                      {lines(recipe.instructions).map((text, i) => (
                        <li key={i}>
                          <span>{i + 1}</span>
                          {text}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <div className="ej-panel ej-notes">
                      <h3>Make it yours.</h3>
                      <p>Save what worked, and what you’d do differently.</p>
                      <RecipeNotes
                        preview={preview}
                        recipeId={recipe.id}
                        recipeName={recipe.recipe_name}
                        profiles={[data.profile]}
                      />
                    </div>
                  )}
                </div>
              </section>
              <section className="ej-recipe-description">
                <span className="ej-eyebrow">{recipe.course}</span>
                <h1>{recipe.recipe_name}</h1>
                <p className="ej-recipe-deck">{recipe.description}</p>
                <div className="ej-recipe-facts">
                  <span>
                    <Clock />
                    {recipe.total_time}
                  </span>
                  <span>
                    <ChefHat />
                    {recipe.difficulty_level}
                  </span>
                  <span>
                    <Users />
                    {recipe.servings} servings
                  </span>
                </div>
                <div className="ej-actions">
                  <button
                    className="ej-button"
                    onClick={() => {
                      setCook(true);
                      setStep(0);
                    }}
                  >
                    Let’s cook <ArrowRight size={19} />
                  </button>
                  <button
                    className="ej-button ej-button-light"
                    onClick={() =>
                      openSlot(format(new Date(), "yyyy-MM-dd"), recipe.id)
                    }
                  >
                    <CalendarDays size={18} />
                    Add to plan
                  </button>
                </div>
                <div className="ej-tip">
                  <Image
                    width={176}
                    height={176}
                    src="/redesign/ermajean-portrait.png"
                    alt=""
                  />
                  <div>
                    <strong>ErmaJean’s tip</strong>
                    <p>
                      Read it through. Get your ingredients together. You’ve got
                      this.
                    </p>
                  </div>
                </div>
                <details className="ej-panel ej-nutrition">
                  <summary>
                    Nutrition estimate <small>Per serving · Estimated</small>
                  </summary>
                  <div>
                    {[
                      ["Energy", recipe.calories, "kcal"],
                      ["Protein", recipe.protein, "g"],
                      ["Carbs", recipe.carbs, "g"],
                      ["Fat", recipe.fat, "g"],
                    ].map(([label, value, unit]) => (
                      <p key={label}>
                        {label}
                        <strong>
                          {value != null ? `${value} ${unit}` : "Not available"}
                        </strong>
                      </p>
                    ))}
                  </div>
                </details>
                <div className="ej-panel ej-notes">
                  <h2>Make it yours</h2>
                  <p>
                    Add a cooking note, swap ingredients, or jot down what
                    worked for you.
                  </p>
                  <button
                    className="ej-button ej-button-light"
                    onClick={() => setTab("Notes")}
                  >
                    Your cooking notes →
                  </button>
                </div>
                <div className="ej-actions ej-print-actions">
                  <button
                    className="ej-button ej-button-light"
                    onClick={() => window.print()}
                  >
                    <Printer size={18} />
                    Print recipe
                  </button>
                  {preview && (
                    <EditRecipe
                      recipeId={recipe.id}
                      initialRecipe={recipe}
                      preview
                    />
                  )}
                  {!preview && (
                    <div>
                      <span className="ej-small">Edit, share & manage</span>
                      <RecipeSettings
                        recipeId={recipe.id}
                        recipeName={recipe.recipe_name}
                        profiles={[data.profile]}
                        searchParams={{ message: "" }}
                        setOpen={setLegacyOpen}
                        deleteModal={deleteOpen}
                        setDeleteModal={setDeleteOpen}
                      />
                    </div>
                  )}
                </div>
              </section>
            </div>
          </>
        )}
        {(view === "plan" || view === "shop") && (
          <div
            className={`ej-planner-layout ${view === "shop" ? "ej-shop-layout" : ""}`}
          >
            <section>
              <div className="ej-heading">
                <h1>
                  {view === "shop"
                    ? "A little shop. A lot easier."
                    : "This week, loosely."}
                  <span className="ej-spark">〃</span>
                </h1>
                <p>
                  {view === "shop"
                    ? "Get what you need. Use what you’ve got."
                    : "Plan a few. Leave room for life."}
                </p>
              </div>
              <div className="ej-week-controls">
                <button
                  aria-label="Previous week"
                  onClick={() => {
                    setWeek(addDays(week, -7));
                    setChecked([]);
                  }}
                >
                  <ChevronLeft />
                </button>
                <h2>
                  {format(week, "MMMM d")}–{format(days[6], "d")}
                </h2>
                <button
                  aria-label="Next week"
                  onClick={() => {
                    setWeek(addDays(week, 7));
                    setChecked([]);
                  }}
                >
                  <ChevronRight />
                </button>
                <select
                  aria-label="Meal view"
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                >
                  {["Breakfast", "Lunch", "Dinner"].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <button className="ej-button" onClick={() => openSlot(start)}>
                  <Plus size={18} />
                  Add meal
                </button>
              </div>
              {view === "shop" ? (
                shoppingPane
              ) : (
                <div className="ej-week-grid">
                  {days.map((day) => {
                    const date = format(day, "yyyy-MM-dd");
                    const meal = meals.find(
                      (m) => m.date === date && m.meal_type === mealType,
                    );
                    const r = data.recipes.find(
                      (r) => r.id === meal?.recipe_id,
                    );
                    return (
                      <article className="ej-day ej-panel" key={date}>
                        <h3>{format(day, "EEEE")}</h3>
                        <p className="ej-muted ej-small">
                          {format(day, "MMM d")}
                        </p>
                        {r && meal ? (
                          <>
                            <Link href={detail(r)}>
                              <Food recipe={r} preview={preview} />
                              <h3>{r.recipe_name}</h3>
                              <p className="ej-small">
                                {r.total_time} · Serves {r.servings}
                              </p>
                            </Link>
                            <div className="ej-meal-actions">
                              <button
                                disabled={busy}
                                onClick={() => openSlot(date, r.id)}
                              >
                                Swap
                              </button>
                              <button
                                disabled={busy}
                                onClick={() => openSlot(date, r.id, meal.id)}
                              >
                                Move
                              </button>
                              <button
                                disabled={busy}
                                onClick={() => removeMeal(meal)}
                              >
                                Remove
                              </button>
                            </div>
                          </>
                        ) : (
                          <button
                            className="ej-add-slot"
                            onClick={() => openSlot(date)}
                          >
                            <span>
                              <Plus size={25} />
                            </span>
                            <h3>Add {mealType.toLowerCase()}</h3>
                            <p>
                              Not sure yet?
                              <br />
                              That’s okay.
                            </p>
                          </button>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
            {view === "plan" && shoppingPane}
          </div>
        )}
        {view === "recipe" && recipe && (
          <article className="ej-print-recipe">
            <h1>{recipe.recipe_name}</h1>
            <p>{recipe.description}</p>
            <p>
              {recipe.total_time} · {recipe.servings} servings
            </p>
            <h2>Ingredients</h2>
            <ul>
              {lines(recipe.ingredients).map((text, i) => (
                <li key={i}>{text}</li>
              ))}
            </ul>
            <h2>Steps</h2>
            <ol>
              {lines(recipe.instructions).map((text, i) => (
                <li key={i}>{text}</li>
              ))}
            </ol>
          </article>
        )}
      </main>
      <Modal
        open={slot !== null}
        setOpen={(v) => {
          if (!v) setSlot(null);
        }}
        height="h-auto"
      >
        <DialogTitle className="ej-dialog-title">
          {moveId ? "Move a meal" : "Make a little plan"}
        </DialogTitle>
        <div className="ej-modal-form">
          <label>
            Date
            <input
              type="date"
              value={slot || ""}
              onChange={(e) => setSlot(e.target.value)}
            />
          </label>
          <label>
            Meal
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
            >
              {["Breakfast", "Lunch", "Dinner"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label>
            Recipe
            <select value={choice} onChange={(e) => setChoice(e.target.value)}>
              {data.recipes.map((r) => (
                <option value={r.id} key={r.id}>
                  {r.recipe_name}
                </option>
              ))}
            </select>
          </label>
          {!data.recipes.length && (
            <p>Save a recipe first, then add it to your week.</p>
          )}
          {message && <p role="alert">{message}</p>}
          <button
            className="ej-button"
            disabled={busy || !choice || !slot}
            onClick={saveMeal}
          >
            {busy ? "Saving…" : moveId ? "Move meal" : "Save to plan"}
          </button>
          <button onClick={() => setSlot(null)}>Cancel</button>
        </div>
      </Modal>
      <Modal open={cook} setOpen={setCook} height="h-auto">
        <DialogTitle className="ej-dialog-title">Let’s cook.</DialogTitle>
        {recipe && (
          <div className="ej-cooking">
            <p>{recipe.recipe_name}</p>
            <span>
              Step {step + 1} of {lines(recipe.instructions).length}
            </span>
            <h2>
              {lines(recipe.instructions)[step] ||
                "No cooking steps saved yet."}
            </h2>
            <div className="ej-actions">
              <button
                className="ej-button ej-button-light"
                disabled={step === 0}
                onClick={() => setStep(step - 1)}
              >
                Back
              </button>
              {step < lines(recipe.instructions).length - 1 ? (
                <button className="ej-button" onClick={() => setStep(step + 1)}>
                  Next step →
                </button>
              ) : (
                <button className="ej-button" onClick={() => setCook(false)}>
                  Dinner, handled.
                </button>
              )}
            </div>
            <button onClick={() => setCook(false)}>Close cooking mode</button>
          </div>
        )}
      </Modal>
      <Modal open={help} setOpen={setHelp} height="h-auto">
        <DialogTitle className="ej-dialog-title">
          A hand in your kitchen.
        </DialogTitle>
        <p>
          Start in Kitchen with what you have. Keep favorites in Recipes, add
          meals to Plan, and check ingredients in Shop.
        </p>
        <button className="ej-button" onClick={() => setHelp(false)}>
          Got it
        </button>
      </Modal>
      <ProfileSettings
        open={profileOpen}
        setOpen={setProfileOpen}
        profile={[data.profile]}
        preview={preview}
      />
    </div>
  );
}
