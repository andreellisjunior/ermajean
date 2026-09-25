"use client";
import { useState } from "react";
import { DialogTitle } from "@headlessui/react";
import { Plus, BookOpen, Sparkles } from "lucide-react";
import { addAIRecipeAction, addNewRecipeAction } from "@/app/actions";
import { getPlanType, getRecipeLimit } from "@/libs/planUtils";
import Modal from "./Modal";
import { Button } from "./button";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { SubmitButton } from "./submit-button";
import PaidFeatureModal from "./PaidFeatureModal";
import { Message } from "./form-message";
export default function AddNewRecipe({
  profiles,
  count,
  preview = false,
}: {
  searchParams: Message;
  profiles: { location?: string; has_access: boolean; price_id?: string }[];
  count: number;
  preview?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [mode, setMode] = useState<"manual" | "ai" | null>(null);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState("");
  const profile = profiles?.[0];
  const limit = getRecipeLimit(
    getPlanType(profile?.has_access || false, profile?.price_id),
  );
  return (
    <>
      <div>
        <Button
          aria-label="Add a recipe"
          onClick={() => {
            setRequestId(crypto.randomUUID());
            setOpen(true);
            setMode(null);
            setError("");
          }}
        >
          <Plus size={18} />
          Add recipe
        </Button>
      </div>
      <Modal open={open} setOpen={setOpen}>
        <DialogTitle>
          {mode === "ai"
            ? "Let’s figure out dinner."
            : mode === "manual"
              ? "Keep a good one."
              : "Your next keeper."}
        </DialogTitle>
        {!mode ? (
          <div className="ej-note-list">
            <button
              className="ej-note-card"
              onClick={() =>
                limit !== null && count >= limit ? setPaid(true) : setMode("ai")
              }
            >
              <Sparkles />
              <h3>Give ErmaJean the ingredients.</h3>
              <p>Get a new recipe for what you have and the time you’ve got.</p>
              <small>
                {limit === null
                  ? "Unlimited recipes"
                  : `${Math.max(0, limit - count)} recipes remaining in your allowance`}
              </small>
            </button>
            <button className="ej-note-card" onClick={() => setMode("manual")}>
              <BookOpen />
              <h3>Add your own.</h3>
              <p>
                Save the family favorite, the weeknight winner, or your latest
                experiment.
              </p>
            </button>
          </div>
        ) : (
          <form
            className="ej-dialog-form"
            onSubmit={(event) => {
              const form = event.currentTarget;
              const input = form.elements.namedItem(
                "requestId",
              ) as HTMLInputElement;
              const body = JSON.stringify(
                Array.from(new FormData(form).entries()).filter(
                  ([k]) => k !== "requestId",
                ),
              );
              if (form.dataset.requestInput !== body) {
                input.value = crypto.randomUUID();
                form.dataset.requestInput = body;
              }
            }}
            action={async (form) => {
              setError("");
              if (preview) {
                setError("Preview only. Nothing has been saved or generated.");
                return;
              }
              try {
                if (mode === "ai") await addAIRecipeAction(form);
                else await addNewRecipeAction(form);
                setOpen(false);
              } catch (e) {
                if (e instanceof Error && e.message === "NEXT_REDIRECT")
                  throw e;
                setError(
                  "That recipe couldn’t be saved. Your entries are still here. Try again.",
                );
              }
            }}
          >
            <input type="hidden" name="requestId" value={requestId} />
            {mode === "ai" ? (
              <>
                <label>
                  What sounds good?
                  <Input
                    name="taste"
                    required
                    placeholder="Something cozy with bold flavor"
                  />
                </label>
                <label>
                  What have you got?
                  <Input
                    name="ingredients"
                    placeholder="Chicken, rice, spinach…"
                  />
                </label>
                <label>
                  How many are eating?
                  <Input
                    name="serving"
                    type="number"
                    min={1}
                    max={24}
                    defaultValue={4}
                    required
                  />
                </label>
                <label>
                  Time you have
                  <Input name="totalTime" defaultValue="30 minutes" required />
                </label>
                <label>
                  Anything to work around?
                  <Input
                    name="restrictions"
                    placeholder="Allergies or dietary preferences (optional)"
                  />
                </label>
                <input
                  type="hidden"
                  name="location"
                  value={profile?.location || "USA"}
                />
              </>
            ) : (
              <>
                <label>
                  Recipe name
                  <Input
                    name="recipeName"
                    required
                    placeholder="The pasta everyone asks for"
                  />
                </label>
                <label>
                  A little about it
                  <Textarea
                    name="desc"
                    required
                    placeholder="Why this one is a keeper"
                  />
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    ["prepTime", "Prep time"],
                    ["cookTime", "Cook time"],
                    ["estTotalTime", "Total time"],
                  ].map(([name, label]) => (
                    <label key={name}>
                      {label}
                      <Input name={name} required placeholder="20 minutes" />
                    </label>
                  ))}
                </div>
                <label>
                  Servings
                  <Input
                    name="servings"
                    type="number"
                    min={1}
                    required
                    defaultValue={4}
                  />
                </label>
                <label>
                  Difficulty
                  <select name="level" defaultValue="Easy">
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Advanced</option>
                  </select>
                </label>
                <label>
                  Ingredients
                  <Textarea
                    name="ingredients"
                    required
                    placeholder="One ingredient per line, including quantities"
                  />
                </label>
                <label>
                  Steps
                  <Textarea
                    name="instructions"
                    required
                    placeholder="One step per line"
                  />
                </label>
                <details>
                  <summary>Nutrition estimates (optional)</summary>
                  <p className="ej-dialog-muted">
                    Enter values per serving. Leave unknown values blank.
                  </p>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {[
                      ["calories", "Energy (kcal)"],
                      ["protein", "Protein (g)"],
                      ["carbs", "Carbs (g)"],
                      ["fat", "Fat (g)"],
                      ["fiber", "Fiber (g)"],
                      ["sugar", "Sugar (g)"],
                      ["sodium", "Sodium (mg)"],
                    ].map(([name, label]) => (
                      <label key={name}>
                        {label}
                        <Input name={name} type="number" min={0} step="any" />
                      </label>
                    ))}
                  </div>
                </details>
              </>
            )}
            <label>
              Meal
              <select name="course" defaultValue="Dinner">
                {["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"].map(
                  (value) => (
                    <option key={value}>{value}</option>
                  ),
                )}
              </select>
            </label>
            {error && (
              <p role="alert" className="ej-dialog-error">
                {error}
              </p>
            )}
            <div className="ej-dialog-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMode(null)}
              >
                Back
              </Button>
              <SubmitButton
                pendingText={mode === "ai" ? "Working on dinner…" : "Saving…"}
              >
                {mode === "ai" ? "Find my dinner" : "Save recipe"}
              </SubmitButton>
            </div>
          </form>
        )}
      </Modal>
      <PaidFeatureModal open={paid} setOpen={setPaid} preview={preview} />
    </>
  );
}
