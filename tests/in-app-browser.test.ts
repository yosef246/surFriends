// Run: node --test tests/in-app-browser.test.ts (Node >= 22.18 strips types natively)
import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error -- .ts extension is required by node --test, not allowed by tsc config
import { isInAppBrowser } from "../lib/in-app-browser.ts";

const IOS = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko)";
const cases: [string, string, boolean][] = [
  ["WhatsApp iOS", `${IOS} Mobile/15E148 WhatsApp/2.24.1`, true],
  ["Instagram iOS", `${IOS} Mobile/15E148 Instagram 300.0.0`, true],
  ["Facebook Android", "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/440.0]", true],
  ["TikTok", `${IOS} Mobile/15E148 musical_ly_30.0.0`, true],
  ["LinkedIn", `${IOS} Mobile/15E148 LinkedInApp`, true],
  ["Android WebView", "Mozilla/5.0 (Linux; Android 13; Pixel 7; wv) AppleWebKit/537.36 Version/4.0 Chrome/120.0 Mobile Safari/537.36", true],
  ["Chrome desktop", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36", false],
  ["Chrome Android", "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36", false],
  ["Safari iOS", `${IOS} Version/17.0 Mobile/15E148 Safari/604.1`, false],
  ["Firefox", "Mozilla/5.0 (Windows NT 10.0; rv:121.0) Gecko/20100101 Firefox/121.0", false],
  ["Samsung Internet", "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0 Mobile Safari/537.36", false],
];

for (const [name, ua, expected] of cases) {
  test(name, () => assert.equal(isInAppBrowser(ua), expected));
}
test("empty UA", () => assert.equal(isInAppBrowser(""), false));
