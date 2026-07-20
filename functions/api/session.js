const encoder = new TextEncoder();

const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    ...headers
  }
});

const base64Url = bytes => btoa(String.fromCharCode(...bytes))
  .replaceAll("+", "-")
  .replaceAll("/", "_")
  .replaceAll("=", "");

const decodeBase64Url = value => {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padding = "=".repeat((4 - normalized.length % 4) % 4);
  return Uint8Array.from(atob(normalized + padding), character => character.charCodeAt(0));
};

const hmac = async (value, secret) => {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
};

const constantTimeTextEqual = (left, right) => {
  const a = encoder.encode(String(left));
  const b = encoder.encode(String(right));
  const length = Math.max(a.length, b.length);
  let difference = a.length ^ b.length;
  for (let index = 0; index < length; index += 1) {
    difference |= (a[index] || 0) ^ (b[index] || 0);
  }
  return difference === 0;
};

const sessionValid = async (request, secret) => {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|;\s*)nk_session=([^;]+)/);
  if (!match || !secret) return false;
  const [payload, signature] = match[1].split(".");
  if (!payload || !signature) return false;
  try {
    const expected = await hmac(payload, secret);
    const supplied = decodeBase64Url(signature);
    if (expected.length !== supplied.length) return false;
    let difference = 0;
    expected.forEach((value, index) => { difference |= value ^ supplied[index]; });
    if (difference !== 0) return false;
    const session = JSON.parse(new TextDecoder().decode(decodeBase64Url(payload)));
    return Number(session.exp) > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
};

export const onRequestGet = async context => {
  const configured = Boolean(context.env.BAND_PIN && context.env.SESSION_SECRET);
  if (!configured) return json({ authenticated: false, configured: false }, 503);
  const authenticated = await sessionValid(context.request, context.env.SESSION_SECRET);
  return json({ authenticated, configured: true }, authenticated ? 200 : 401);
};

export const onRequestPost = async context => {
  if (!context.env.BAND_PIN || !context.env.SESSION_SECRET) {
    return json({ error: "CloudflareのBAND_PINとSESSION_SECRETを設定してください。" }, 503);
  }
  let body;
  try { body = await context.request.json(); }
  catch { return json({ error: "PINを入力してください。" }, 400); }
  if (!constantTimeTextEqual(body.pin, context.env.BAND_PIN)) {
    return json({ error: "PINが違います。" }, 401);
  }
  const expiresIn = 60 * 60 * 24 * 30;
  const payload = base64Url(encoder.encode(JSON.stringify({
    exp: Math.floor(Date.now() / 1000) + expiresIn
  })));
  const signature = base64Url(await hmac(payload, context.env.SESSION_SECRET));
  const cookie = `nk_session=${payload}.${signature}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${expiresIn}`;
  return json({ authenticated: true }, 200, { "set-cookie": cookie });
};

export const onRequestDelete = async () => json(
  { authenticated: false },
  200,
  { "set-cookie": "nk_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0" }
);
