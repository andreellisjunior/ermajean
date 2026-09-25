import { supabase } from "./supabase";
const exchanges = new Map<string, Promise<void>>();
/** Both the browser return and Router can see the same one-time PKCE code. */
export function exchangeAuthCode(code: string): Promise<void> {
  const pending = exchanges.get(code);
  if (pending) return pending;
  const exchange = (async () => {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
  })();
  exchanges.set(code, exchange);
  void exchange.catch(() => exchanges.delete(code));
  return exchange;
}
export async function completeAuthUrl(value: string) {
  const url = new URL(value);
  const params = new URLSearchParams(url.search);
  new URLSearchParams(url.hash.slice(1)).forEach((v, k) => params.set(k, v));
  const error = params.get("error_description") || params.get("error");
  if (error) throw Error(error);
  const code = params.get("code");
  if (code) {
    await exchangeAuthCode(code);
    return;
  }
  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");
  if (access_token && refresh_token) {
    const { error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    if (error) throw error;
    return;
  }
  throw Error("This sign-in link is incomplete. Please try again.");
}
