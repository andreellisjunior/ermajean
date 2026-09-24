"use client";
import {
  deleteUserAction,
  signOutAction,
  updateProfileAction,
} from "@/app/actions";
import MacroGoalsForm from "@/components/ui/MacroGoalsForm";
import apiClient from "@/libs/api";
import { createClient } from "@/libs/supabase/client";
import { Profile } from "@/types";
import { DialogTitle } from "@headlessui/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { DeleteWarning } from "./DeleteWarning";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import Modal from "./ui/Modal";
import PaidFeatureModal from "./ui/PaidFeatureModal";
import { SubmitButton } from "./ui/submit-button";
export default function ProfileSettings({
  open,
  setOpen,
  profile: initialProfile,
  preview = false,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  profile: Profile[] | null;
  preview?: boolean;
}) {
  const [profile, setProfile] = useState(initialProfile);
  const [danger, setDanger] = useState(false);
  const [billing, setBilling] = useState(false);
  const [goals, setGoals] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => setProfile(initialProfile), [initialProfile]);
  const person = profile?.[0];
  async function refresh() {
    if (preview) return;
    const db = createClient();
    const {
      data: { user },
    } = await db.auth.getUser();
    if (!user) return;
    const result = await db
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (result.error) {
      setError(
        "Your goals were saved, but the profile could not refresh. Reopen settings to retry.",
      );
      return;
    }
    setProfile([result.data]);
  }
  async function manageBilling() {
    if (preview) {
      setBilling(true);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const data = (await apiClient.get("/user")) as { access: boolean };
      if (!data.access) {
        setBilling(true);
        return;
      }
      const { url } = (await apiClient.post("/stripe/create-portal", {
        returnUrl: window.location.href,
      })) as { url: string };
      if (!url) throw new Error();
      window.location.href = url;
    } catch {
      setError("Billing couldn’t open. Please try Subscription again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Modal open={open} setOpen={setOpen} height="h-auto">
        <DialogTitle>Your kitchen. Your way.</DialogTitle>
        <div className="ej-settings-intro">
          <span className="ej-settings-avatar">{person?.name?.[0] || "Y"}</span>
          <div>
            <strong>{person?.name || "Welcome, friend"}</strong>
            <p className="ej-dialog-muted">
              Good food starts with what works for you.
            </p>
          </div>
        </div>
        {error && (
          <p className="ej-dialog-error" role="alert">
            {error}
          </p>
        )}
        <section className="ej-dialog-section">
          <h3>The basics</h3>
          <form
            className="ej-dialog-form"
            action={async (data) => {
              if (preview) {
                setError("Preview only. Your account has not changed.");
                return;
              }
              try {
                await updateProfileAction(data);
                setOpen(false);
              } catch (e) {
                if (e instanceof Error && e.message === "NEXT_REDIRECT")
                  throw e;
                setError(
                  "Your profile could not be saved. Your entries are still here; try again.",
                );
              }
            }}
          >
            <label>
              Your name
              <Input
                name="name"
                defaultValue={person?.name}
                autoComplete="name"
                required
              />
            </label>
            <label>
              Location
              <Input
                name="location"
                defaultValue={person?.location || "USA"}
                autoComplete="country-name"
              />
              <span className="ej-dialog-muted">
                Used for local ingredient cost estimates.
              </span>
            </label>
            <label>
              Email
              <Input name="email" value={person?.email || ""} disabled />
            </label>
            <SubmitButton pendingText="Saving…">Save profile</SubmitButton>
          </form>
        </section>
        <section className="ej-dialog-section">
          <h3>Fuel, not rules.</h3>
          <p className="ej-dialog-muted">
            Your nutrition goals are optional. Make them work for your life.
          </p>
          {goals ? (
            <MacroGoalsForm
              preview={preview}
              currentGoals={
                person
                  ? {
                      calories: person.calorie_goal,
                      protein: person.protein_goal,
                      carbs: person.carb_goal,
                      fat: person.fat_goal,
                    }
                  : undefined
              }
              onSave={refresh}
              onClose={() => setGoals(false)}
            />
          ) : (
            <div className="ej-setting-row">
              <p>Set energy, protein, carbohydrate, and fat goals.</p>
              <Button variant="outline" onClick={() => setGoals(true)}>
                Edit goals
              </Button>
            </div>
          )}
        </section>
        <section className="ej-dialog-section">
          <h3>Your plan</h3>
          <div className="ej-setting-row">
            <div>
              <strong>
                {person?.has_access ? "Premium kitchen" : "Free kitchen"}
              </strong>
              <p>Review your subscription and billing.</p>
            </div>
            <Button variant="outline" disabled={busy} onClick={manageBilling}>
              {busy ? "Opening…" : "Subscription"}
            </Button>
          </div>
        </section>
        <section className="ej-dialog-section">
          <h3>A fresh start</h3>
          <div className="ej-dialog-actions">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh app
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                preview
                  ? setError("Preview only. No account is signed in.")
                  : signOutAction()
              }
            >
              Sign out
            </Button>
          </div>
        </section>
        <section className="ej-danger">
          <h3>Delete account</h3>
          <p className="ej-dialog-muted">
            Permanently remove your account and recipes. This cannot be undone.
          </p>
          <div className="ej-dialog-actions">
            <Button variant="destructive" onClick={() => setDanger(true)}>
              Delete account
            </Button>
          </div>
        </section>
      </Modal>
      <PaidFeatureModal open={billing} setOpen={setBilling} preview={preview} />
      <DeleteWarning
        open={danger}
        setOpen={setDanger}
        title="Delete account"
        desc="Your account, recipes, and shared recipes will be permanently removed. This cannot be undone."
        action={async () => {
          if (preview) throw new Error("Preview only");
          await deleteUserAction();
        }}
      />
    </>
  );
}
