import { env } from "cloudflare:workers";

const allowedKeys = new Set([
  "kitchen2:ratings", "kitchen2:duties", "kitchen2:orders", "kitchen2:issues",
  "kitchen2:hs", "kitchen2:chal", "kitchen2:players",
]);

function validKey(key: string) {
  return allowedKeys.has(key);
}

async function ensureTable() {
  await env.DB.prepare(
    "CREATE TABLE IF NOT EXISTS shared_state (key text PRIMARY KEY NOT NULL, value text NOT NULL, updated_at integer NOT NULL)"
  ).run();
}

export async function GET(_request: Request, context: { params: Promise<{ key: string }> }) {
  const { key } = await context.params;
  if (!validKey(key)) return Response.json({ error: "Invalid key" }, { status: 400 });
  await ensureTable();
  const row = await env.DB.prepare("SELECT value FROM shared_state WHERE key = ?").bind(key).first<{ value: string }>();
  return Response.json({ value: row?.value ?? null }, { headers: { "cache-control": "no-store" } });
}

export async function PUT(request: Request, context: { params: Promise<{ key: string }> }) {
  const { key } = await context.params;
  if (!validKey(key)) return Response.json({ error: "Invalid key" }, { status: 400 });
  await ensureTable();
  const body = await request.json().catch(() => null) as { value?: unknown } | null;
  if (!body || typeof body.value !== "string" || body.value.length > 1_000_000) {
    return Response.json({ error: "Invalid value" }, { status: 400 });
  }
  JSON.parse(body.value);
  await env.DB.prepare(
    "INSERT INTO shared_state (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at"
  ).bind(key, body.value, Date.now()).run();
  return Response.json({ ok: true });
}
