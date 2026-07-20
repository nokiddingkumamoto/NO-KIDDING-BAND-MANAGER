const encoder = new TextEncoder();

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  }
});

const decodeBase64Url = value => {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padding = "=".repeat((4 - normalized.length % 4) % 4);
  return Uint8Array.from(atob(normalized + padding), character => character.charCodeAt(0));
};

const equalBytes = (left, right) => {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
};

const verifySession = async (request, secret) => {
  if (!secret) return false;
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|;\s*)nk_session=([^;]+)/);
  if (!match) return false;
  const [payload, signature] = match[1].split(".");
  if (!payload || !signature) return false;
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const valid = await crypto.subtle.verify("HMAC", key, decodeBase64Url(signature), encoder.encode(payload));
    if (!valid) return false;
    const session = JSON.parse(new TextDecoder().decode(decodeBase64Url(payload)));
    return Number(session.exp) > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
};

export const onRequest = async context => {
  const pathname = new URL(context.request.url).pathname;
  if (pathname.endsWith("/api/session") || context.request.method === "OPTIONS") {
    return context.next();
  }
  if (!context.env.SESSION_SECRET) {
    return json({ error: "CloudflareのSESSION_SECRETが設定されていません。" }, 503);
  }
  if (!await verifySession(context.request, context.env.SESSION_SECRET)) {
    return json({ error: "login_required" }, 401);
  }
  return context.next();
};
