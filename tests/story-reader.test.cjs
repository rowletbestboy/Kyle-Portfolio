const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const storyIds = ["the-date", "the-perfect-girl", "when-he-had-nothing"];
const storyDataPath = path.join(root, "stories", "story-data.js");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

function loadStories() {
  assert.ok(fs.existsSync(storyDataPath), "shared story data should exist");
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(storyDataPath, "utf8"), context);
  return context.window.storyData;
}

test("the Stories category links to all three dedicated static routes", () => {
  const html = read("index.html");
  const storyCards = [...html.matchAll(/<a class="work-item" data-form="Stories" href="([^"]+)"/g)];

  assert.deepEqual(
    storyCards.map(([, href]) => href),
    storyIds.map((id) => `stories/${id}/`),
  );
  assert.match(html, /data-f="Stories"/);
  assert.match(html, /data-f="Articles"/);
  assert.match(html, /data-f="News"/);
  assert.match(html, /data-f="Promotional Posts"/);
});

test("story data contains complete approved text and matching covers", () => {
  const stories = loadStories();

  assert.deepEqual(Object.keys(stories), storyIds);
  for (const id of storyIds) {
    const story = stories[id];
    assert.ok(story.title);
    assert.equal(story.author, "Kyle Apelado");
    assert.ok(story.category);
    assert.ok(story.synopsis);
    assert.ok(story.cover);
    assert.ok(fs.existsSync(path.join(root, story.cover)), `cover should exist for ${id}`);
    assert.ok(story.content.length > 10, `content should include the full story for ${id}`);
    assert.ok(
      story.content.reduce((total, block) => total + block.text.split(/\s+/).length, 0) > 1000,
      `content should contain the complete manuscript for ${id}`,
    );
    assert.equal(story.content.at(-1).type, "ending");
    assert.ok(story.content.every((block) => block.type && block.text));
  }
});

test("each story route provides title metadata and loads the shared reader", () => {
  const stories = loadStories();

  for (const id of storyIds) {
    const route = path.join("stories", id, "index.html");
    assert.ok(fs.existsSync(path.join(root, route)), `static route should exist for ${id}`);
    const html = read(route);
    assert.match(html, new RegExp(`<title>${stories[id].title} \\| Kyle Apelado</title>`));
    assert.match(html, /<meta name="author" content="Kyle Apelado">/);
    assert.match(html, new RegExp(`data-story-id="${id}"`));
    assert.match(html, /\.\.\/story-reader\.css/);
    assert.match(html, /\.\.\/story-reader\.js/);
  }
});

test("reader includes progress, font controls, navigation, and copying deterrents", () => {
  assert.ok(fs.existsSync(path.join(root, "stories", "story-reader.js")));
  assert.ok(fs.existsSync(path.join(root, "stories", "story-reader.css")));
  const reader = read("stories/story-reader.js");
  const styles = read("stories/story-reader.css");

  assert.match(reader, /setAttribute\("role", "progressbar"\)/);
  assert.match(reader, /Increase story text size/);
  assert.match(reader, /Decrease story text size/);
  assert.match(reader, /Previous story|Next story/);
  assert.match(reader, /contextmenu/);
  assert.match(reader, /preventDefault/);
  assert.match(reader, /link\("\.\.\/\.\.\/#work", "Back to Selected Work"/);
  assert.match(reader, /story-watermark/);
  assert.match(reader, /\["a", "c", "p", "s"\]/);
  assert.match(styles, /user-select:\s*none/);
  assert.match(styles, /width:\s*min\(100%,\s*44rem\)/);
  assert.match(styles, /@media/);
});

test("story cover images are created without invalid child text", () => {
  const reader = read("stories/story-reader.js");

  assert.match(reader, /var cover = element\("img"\);/);
  assert.doesNotMatch(reader, /element\("img", "", story\.title/);
});

test("original PDFs are not present in the public Stories asset directory", () => {
  const publicStories = path.join(root, "assets", "Stories");
  const files = fs.readdirSync(publicStories, { withFileTypes: true });

  assert.deepEqual(
    files.filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".pdf")),
    [],
  );
});
