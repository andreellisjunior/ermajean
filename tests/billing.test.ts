import test from "node:test";
import assert from "node:assert/strict";
import {
  getPlanType,
  getRecipeLimit,
  MONTHLY_PRICE_ID,
  YEARLY_PRICE_ID,
  isCheckoutPrice,
} from "../libs/planUtils";
import {
  allowedWebReturn,
  recoveryTarget,
  ownsCheckout,
  subscriptionEntitlement,
} from "../libs/billing-policy";
import { reconcileBilling } from "../libs/billing-reconcile";
const sub = (status: string, price: string) => ({
  status,
  items: { data: [{ price: { id: price } }] },
});
test("only exact production catalog grants entitlement", () => {
  assert.equal(getPlanType(true, MONTHLY_PRICE_ID), "monthly");
  assert.equal(getPlanType(true, YEARLY_PRICE_ID), "unlimited");
  assert.equal(getRecipeLimit(getPlanType(true, "price_unknown")), 0);
  assert.equal(getPlanType(false, YEARLY_PRICE_ID), "free");
  assert.equal(isCheckoutPrice("price_1S2vTcImUkOCj07bxK3ppMcn"), false);
});
test("return URLs reject external origin, credentials, unsupported paths", () => {
  for (const value of [
    "https://evil.example/recipes",
    "//evil.example/recipes",
    "https://user@ermajean.com/recipes",
    "/api/auth/callback",
  ])
    assert.equal(allowedWebReturn(value, "https://ermajean.com"), null);
  assert.ok(allowedWebReturn("/recipes", "https://ermajean.com"));
  assert.equal(recoveryTarget("https://evil.example"), "/kitchen");
  assert.equal(
    recoveryTarget("ermajean://reset-password"),
    "ermajean://reset-password",
  );
});
test("session details require matching authenticated owner", () => {
  assert.equal(
    ownsCheckout(
      { client_reference_id: "owner", customer: "cus_1" },
      "other",
      "cus_2",
    ),
    false,
  );
  assert.equal(ownsCheckout({ client_reference_id: "owner" }, "owner"), true);
  assert.equal(
    ownsCheckout({ customer: { id: "cus_1" } }, "owner", "cus_1"),
    true,
  );
});
test("current complete state overrides stale invoice/cancellation snapshots", () => {
  assert.equal(
    subscriptionEntitlement([
      sub("canceled", YEARLY_PRICE_ID),
      sub("active", MONTHLY_PRICE_ID),
    ]).priceId,
    MONTHLY_PRICE_ID,
  );
  assert.equal(
    subscriptionEntitlement([sub("past_due", YEARLY_PRICE_ID)]).hasAccess,
    false,
  );
  assert.equal(
    subscriptionEntitlement([sub("active", "unknown")]).hasAccess,
    false,
  );
});
test("duplicate and busy events do not read or apply state", async () => {
  for (const result of ["processed", "busy"] as const) {
    assert.equal(
      await reconcileBilling({
        claim: async () => result,
        retrieve: async () => {
          throw Error("unexpected retrieval");
        },
        commit: async () => {
          throw Error("unexpected commit");
        },
        release: async () => {},
      }),
      result,
    );
  }
});
test("failed commit is released for retry and fresh state is read again", async () => {
  let attempts = 0,
    released = 0,
    committed = 0;
  const run = () =>
    reconcileBilling({
      claim: async () => "acquired",
      retrieve: async () => [
        sub(attempts ? "canceled" : "active", MONTHLY_PRICE_ID),
      ],
      commit: async (e) => {
        if (!attempts++) throw Error("database failure");
        assert.equal(e.hasAccess, false);
        committed++;
      },
      release: async () => {
        released++;
      },
    });
  await assert.rejects(run);
  assert.equal(await run(), "processed");
  assert.equal(released, 1);
  assert.equal(committed, 1);
});
