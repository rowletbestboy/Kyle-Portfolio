const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const portfolioPath = path.resolve(__dirname, "..", "Kyle_Portf.html");

test("portfolio footer contains only the copyright notice and no errata section", () => {
  const html = fs.readFileSync(portfolioPath, "utf8");
  const footer = html.match(/<footer\b[^>]*>([\s\S]*?)<\/footer>/i);

  assert.ok(footer, "portfolio footer should exist");
  const footerText = footer[1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  assert.equal(footerText, "© 2026 Kyle Apelado.");
  assert.doesNotMatch(html, /class="(?:errata|colophon)"/);
  assert.doesNotMatch(footer[1], /errata/i);
});
