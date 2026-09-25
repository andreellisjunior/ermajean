import { subscriptionEntitlement } from "./billing-policy";
type Snapshot = Parameters<typeof subscriptionEntitlement>[0];
export interface BillingPorts {
  claim: () => Promise<"acquired" | "processed" | "busy">;
  retrieve: () => Promise<Snapshot>;
  commit: (
    entitlement: ReturnType<typeof subscriptionEntitlement>,
    subscriptions: Snapshot,
  ) => Promise<void>;
  release: () => Promise<void>;
}
// The database commit must atomically fence the lease, apply entitlements, and
// record the event. Failed work stays retryable and never enters the done ledger.
export async function reconcileBilling(ports: BillingPorts) {
  const claim = await ports.claim();
  if (claim !== "acquired") return claim;
  try {
    const subscriptions = await ports.retrieve();
    await ports.commit(subscriptionEntitlement(subscriptions), subscriptions);
    return "processed" as const;
  } catch (error) {
    await ports.release().catch((): void => {});
    throw error;
  }
}
