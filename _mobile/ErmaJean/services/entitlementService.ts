import apiClient from "@/libs/api";
export interface Entitlements {
  access: boolean;
  plan: "free" | "monthly" | "unlimited" | "unknown";
  recipe_limit: number | null;
  remaining?: number | null;
}
export async function getEntitlements() {
  return apiClient.get<never, Entitlements>("/user");
}
