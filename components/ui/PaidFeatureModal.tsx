"use client";
import { DialogTitle } from "@headlessui/react";
import { Dispatch, SetStateAction, useState } from "react";
import { Check } from "lucide-react";
import config from "@/config";
import apiClient from "@/libs/api";
import Modal from "./Modal";
import { Button } from "./button";
export default function PaidFeatureModal({
  open,
  setOpen,
  title = "A little more help in the kitchen.",
  description = "Pick the plan that fits your cooking routine. Your saved recipes stay right here.",
  preview = false,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  title?: string;
  description?: string;
  preview?: boolean;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  async function choose(priceId: string) {
    if (preview) {
      setError("Design preview only. No checkout will be opened.");
      return;
    }
    setLoading(priceId);
    setError("");
    try {
      const data = (await apiClient.get("/user")) as { access: boolean };
      const { url } = (await apiClient.post(
        data.access ? "/stripe/create-portal" : "/stripe/create-checkout",
        data.access
          ? { returnUrl: window.location.href }
          : {
              priceId,
              successUrl: window.location.href,
              cancelUrl: window.location.href,
              mode: "subscription",
            },
      )) as { url: string };
      if (!url) throw new Error();
      window.location.assign(url);
    } catch {
      setError(
        "Billing couldn’t open. Your plan has not changed. Please try again.",
      );
      setLoading(null);
    }
  }
  return (
    <Modal open={open} setOpen={setOpen} height="h-auto">
      <DialogTitle>{title}</DialogTitle>
      <p className="ej-dialog-muted">{description}</p>
      {error && (
        <p className="ej-dialog-error" role="alert">
          {error}
        </p>
      )}
      <div className="ej-plan-options">
        {config.stripe.plans
          .filter((p) => p.priceId)
          .map((plan) => (
            <section
              className="ej-plan-option"
              data-featured={plan.isFeatured}
              key={plan.priceId}
            >
              {plan.isFeatured && (
                <span className="ej-plan-badge">A YEAR OF GOOD DINNERS</span>
              )}
              <h3>{plan.name}</h3>
              <p className="ej-price">
                ${plan.price}
                <span> / {plan.name.toLowerCase()}</span>
              </p>
              <p className="ej-dialog-muted">{plan.description}</p>
              <ul>
                {plan.features.map((f) => (
                  <li key={f.name}>
                    <Check size={17} />
                    {f.name}
                  </li>
                ))}
              </ul>
              <Button disabled={!!loading} onClick={() => choose(plan.priceId)}>
                {loading === plan.priceId
                  ? "Opening billing…"
                  : `Choose ${plan.name}`}
              </Button>
            </section>
          ))}
      </div>
      <Button variant="outline" onClick={() => setOpen(false)}>
        Keep my current plan
      </Button>
    </Modal>
  );
}
