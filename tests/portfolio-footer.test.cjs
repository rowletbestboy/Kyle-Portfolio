const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");

test("portfolio footer contains only the copyright notice and no errata section", () => {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const footer = html.match(/<footer\b[^>]*>([\s\S]*?)<\/footer>/i);

  assert.ok(footer, "portfolio footer should exist");
  const footerText = footer[1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  assert.equal(footerText, "© 2026 Kyle Apelado.");
  assert.doesNotMatch(html, /class="(?:errata|colophon)"/);
  assert.doesNotMatch(footer[1], /errata/i);
});

test("the root entry point serves the portfolio and the old URL redirects to it", () => {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const legacy = fs.readFileSync(path.join(root, "Kyle_Portf.html"), "utf8");

  assert.match(html, /<section class="sec" id="work">/);
  assert.match(legacy, /http-equiv=["']refresh["']/i);
  assert.match(legacy, /content=["']0;\s*url=\.\/["']/i);
});
