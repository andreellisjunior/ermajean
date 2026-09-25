import { ApiError } from "./errors";
/** An explicit Authorization header always wins; never downgrade invalid bearer auth to cookies. */
export function bearerToken(request?: Request): string | undefined {
  const value = request?.headers.get("authorization");
  if (value === null || value === undefined) return undefined;
  const match = /^Bearer ([A-Za-z0-9._~-]+)$/i.exec(value);
  if (!match || match[1].length > 8192)
    throw new ApiError(401, "Authentication required");
  return match[1];
}
export async function verifiedIdentity<T>(
  token: string | undefined,
  lookup: (
    token?: string,
  ) => Promise<{ data: { user: T | null }; error: unknown }>,
) {
  const result = await lookup(token);
  if (result.error || !result.data.user)
    throw new ApiError(401, "Authentication required");
  return result.data.user;
}
export async function boundedJson(
  request: Request,
  maxBytes = 32768,
): Promise<unknown> {
  const length = request.headers.get("content-length");
  if (length && (!/^\d+$/.test(length) || Number(length) > maxBytes))
    throw new ApiError(413, "Request is too large");
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  )
    throw new ApiError(415, "Use application/json");
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, "JSON body required");
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) {
        await reader.cancel();
        throw new ApiError(413, "Request is too large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const buffer = new Uint8Array(bytes);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(buffer));
  } catch {
    throw new ApiError(400, "Invalid JSON");
  }
}
