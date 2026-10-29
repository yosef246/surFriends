// Day 13 static security guards (no network, no DB). Reads source files only.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(join(ROOT, dir))) {
    const rel = join(dir, name);
    if (statSync(join(ROOT, rel)).isDirectory()) walk(rel, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(rel.replaceAll("\\", "/"));
  }
  return out;
}

test("service role key is referenced only by lib/supabase/admin.ts", () => {
  const hits = [...walk("app"), ...walk("components"), ...walk("lib")]
    .concat("middleware.ts")
    .filter((f) => read(f).includes("SUPABASE_SERVICE_ROLE_KEY"));
  assert.deepEqual(hits, ["lib/supabase/admin.ts"]);
});

test("createAdminClient is only imported from server-only code", () => {
  const importers = [...walk("app"), ...walk("components"), ...walk("lib")].filter(
    (f) => f !== "lib/supabase/admin.ts" && read(f).includes("createAdminClient"),
  );
  for (const f of importers) {
    const src = read(f);
    assert.ok(!src.startsWith('"use client"'), `${f} is a client file`);
    const ok = src.includes('import "server-only"') || f.startsWith("app/api/");
    assert.ok(ok, `${f} uses the admin client without server-only / route handler`);
  }
  assert.ok(read("lib/supabase/admin.ts").includes('import "server-only"'));
});

test("every exported server action checks the session (except signOut)", () => {
  const files = walk("app").filter((f) => /^"use server"/m.test(read(f)));
  assert.ok(files.length >= 5);
  for (const f of files) {
    const lines = read(f).split("\n");
    lines.forEach((line, i) => {
      const m = /^export async function (\w+)/.exec(line);
      if (!m || m[1] === "signOut") return;
      const body = lines.slice(i, i + 16).join("\n");
      assert.match(body, /getCurrentUser\(\)/, `${f}: ${m[1]} has no getCurrentUser() in its first lines`);
    });
  }
});

test("CRON_SECRET routes use timingSafeEqual and fail closed when the secret is unset", () => {
  for (const f of ["app/api/cron/purge-images/route.ts", "app/api/push/send/route.ts"]) {
    const src = read(f);
    assert.ok(src.includes("timingSafeEqual"), `${f}: no constant-time compare`);
    assert.match(src, /if \(!secret\) return NextResponse\.json\([\s\S]*?status: 500/, `${f}: does not fail closed`);
  }
});

test("service worker only opens same-origin URLs", () => {
  const sw = read("public/sw.js");
  assert.ok(sw.includes("u.origin === self.location.origin"));
  assert.ok(!/openWindow\(\s*(data|event)\./.test(sw), "openWindow must receive the sanitised url only");
});

// BUG-019 (Day 13): RLS lets any authenticated user INSERT a push_subscriptions row with an arbitrary endpoint,
// bypassing isAllowedPushEndpoint (SSRF). Flips to passing once a migration drops that policy.
test("push_subscriptions has no client INSERT policy", { todo: "BUG-019: policy 'Users add own push subscriptions' still exists" }, () => {
  const dir = join(ROOT, "supabase/migrations");
  const all = readdirSync(dir)
    .sort()
    .map((n) => readFileSync(join(dir, n), "utf8"))
    .join("\n");
  const created = /CREATE POLICY "Users add own push subscriptions"/.test(all);
  const dropped = /DROP POLICY (IF EXISTS )?"Users add own push subscriptions"[^;]*;(?![\s\S]*CREATE POLICY "Users add own push subscriptions")/.test(all);
  assert.ok(!created || dropped);
});
