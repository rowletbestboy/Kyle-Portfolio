(function () {
  var root = document.querySelector("[data-story-id]");
  var stories = window.storyData;
  var story = root && stories && stories[root.dataset.storyId];

  if (!root) {
    return;
  }

  if (!story) {
    var errorMessage = document.createElement("p");
    errorMessage.className = "story-error";
    errorMessage.textContent = "This story could not be found.";
    root.replaceChildren(errorMessage);
    console.error("The requested story is missing from the story data.", root.dataset.storyId);
    return;
  }

  function element(tagName, className, text) {
    var node = document.createElement(tagName);
    if (className) {
      node.className = className;
    }
    if (text !== undefined) {
      node.textContent = text;
    }
    return node;
  }

  function link(href, label, className) {
    var node = element("a", className, label);
    node.href = href;
    return node;
  }

  function renderFormattedText(node, block) {
    if (!Array.isArray(block.parts)) {
      node.textContent = block.text;
      return;
    }

    block.parts.forEach(function (part) {
      var partNode;
      if (part.emphasis === "strong") {
        partNode = element("strong", "", part.text);
      } else if (part.emphasis === "italic") {
        partNode = element("em", "", part.text);
      } else {
        partNode = document.createTextNode(part.text);
      }
      node.appendChild(partNode);
    });
  }

  function renderBlock(block) {
    var node;
    if (block.type === "scene-break") {
      node = element("hr", "story-scene-break");
      node.setAttribute("aria-label", "Scene break");
      return node;
    }
    if (block.type === "heading") {
      node = element("h2", "story-section-heading");
    } else if (block.type === "ending") {
      node = element("h2", "story-ending");
    } else if (block.type === "message") {
      node = element("blockquote", "story-message");
    } else if (block.type === "paragraph") {
      node = element("p", "story-paragraph");
    } else {
      console.error("Unsupported story content block type.", block.type);
      return null;
    }
    renderFormattedText(node, block);
    return node;
  }

  document.title = story.title + " | Kyle Apelado";
  var description = document.querySelector('meta[name="description"]');
  if (description) {
    description.content = story.synopsis;
  }

  var page = element("div", "story-page");
  var progress = element("div", "reading-progress");
  progress.setAttribute("role", "progressbar");
  progress.setAttribute("aria-label", "Story reading progress");
  progress.setAttribute("aria-valuemin", "0");
  progress.setAttribute("aria-valuemax", "100");
  progress.setAttribute("aria-valuenow", "0");
  var progressValue = element("span", "reading-progress-value");
  progress.appendChild(progressValue);

  var topBar = element("header", "story-topbar");
  var topInner = element("div", "story-topbar-inner");
  topInner.appendChild(link("../../Kyle_Portf.html#work", "Back to Selected Work", "story-back"));
  topInner.appendChild(element("span", "story-topbar-note", "Selected writing by Kyle Apelado"));
  topBar.appendChild(topInner);

  var intro = element("header", "story-intro");
  var coverFigure = element("figure", "story-cover");
  var cover = element("img");
  cover.src = "../../" + story.cover;
  cover.alt = story.title + " story cover";
  cover.decoding = "async";
  coverFigure.appendChild(cover);
  intro.appendChild(coverFigure);

  var introCopy = element("div", "story-intro-copy");
  introCopy.appendChild(element("p", "story-category", story.category));
  introCopy.appendChild(element("h1", "story-title", story.title));

  var byline = element("p", "story-byline");
  byline.appendChild(element("span", "story-byline-label", "Written by "));
  byline.appendChild(element("span", "story-author", story.author));
  introCopy.appendChild(byline);

  var details = element("dl", "story-details");
  var detailTerm = element("dt", "", "Estimated reading time");
  var detailValue = element("dd", "story-reading-time");
  var wordCount = story.content.reduce(function (total, block) {
    return total + (block.text ? block.text.trim().split(/\s+/).filter(Boolean).length : 0);
  }, 0);
  var readingMinutes = Math.max(1, Math.ceil(wordCount / 220));
  detailValue.textContent = readingMinutes + " min";
  details.appendChild(detailTerm);
  details.appendChild(detailValue);
  introCopy.appendChild(details);
  introCopy.appendChild(element("p", "story-synopsis", story.synopsis));

  var controls = element("div", "story-controls");
  controls.setAttribute("role", "group");
  controls.setAttribute("aria-label", "Reading preferences");
  var controlsLabel = element("span", "story-controls-label", "Text size");
  var decreaseButton = element("button", "story-size-button", "A−");
  decreaseButton.type = "button";
  decreaseButton.setAttribute("aria-label", "Decrease story text size");
  var fontSizeStatus = element("span", "story-size-status", "20 px");
  fontSizeStatus.setAttribute("aria-live", "polite");
  var increaseButton = element("button", "story-size-button", "A+");
  increaseButton.type = "button";
  increaseButton.setAttribute("aria-label", "Increase story text size");
  controls.append(controlsLabel, decreaseButton, fontSizeStatus, increaseButton);
  introCopy.appendChild(controls);
  intro.appendChild(introCopy);

  var article = element("article", "story-content");
  article.tabIndex = 0;
  article.setAttribute("aria-label", story.title + " story text");
  var watermark = element("span", "story-watermark", "© Kyle Apelado · All rights reserved");
  watermark.setAttribute("aria-hidden", "true");
  var prose = element("div", "story-prose");
  story.content.forEach(function (block) {
    var node = renderBlock(block);
    if (node) {
      prose.appendChild(node);
    }
  });
  article.append(watermark, prose);

  var storyIndex = Object.keys(stories).indexOf(root.dataset.storyId);
  var storyIds = Object.keys(stories);
  var navigation = element("nav", "story-navigation");
  navigation.setAttribute("aria-label", "Story navigation");
  var previousId = storyIds[storyIndex - 1];
  var nextId = storyIds[storyIndex + 1];
  var previousLink = previousId
    ? link("../" + previousId + "/", "Previous story", "story-nav-link")
    : link("../../Kyle_Portf.html#work", "Back to Selected Work", "story-nav-link");
  var nextLink = nextId
    ? link("../" + nextId + "/", "Next story", "story-nav-link")
    : link("../../Kyle_Portf.html#work", "Back to Selected Work", "story-nav-link");
  navigation.append(previousLink, nextLink);

  var footer = element("footer", "story-footer");
  footer.appendChild(element("p", "", "Copyright © 2026 Kyle Apelado. All rights reserved."));
  footer.appendChild(element("p", "story-footer-note", "This reading page is provided for personal enjoyment."));

  page.append(progress, topBar, intro, article, navigation, footer);
  root.replaceChildren(page);

  var fontSize = 20;
  function adjustFontSize(amount) {
    fontSize = Math.min(28, Math.max(17, fontSize + amount));
    prose.style.fontSize = fontSize + "px";
    fontSizeStatus.textContent = fontSize + " px";
  }
  decreaseButton.addEventListener("click", function () {
    adjustFontSize(-1);
  });
  increaseButton.addEventListener("click", function () {
    adjustFontSize(1);
  });

  article.addEventListener("contextmenu", function (event) {
    event.preventDefault();
  });
  article.addEventListener("copy", function (event) {
    event.preventDefault();
  });
  document.addEventListener("keydown", function (event) {
    var key = event.key.toLowerCase();
    if ((event.ctrlKey || event.metaKey) && ["a", "c", "p", "s"].includes(key)) {
      event.preventDefault();
    }
  });

  function updateProgress() {
    var articleStart = article.getBoundingClientRect().top + window.scrollY;
    var scrollDistance = article.offsetHeight - window.innerHeight;
    var percentage = scrollDistance <= 0
      ? 100
      : Math.min(100, Math.max(0, ((window.scrollY - articleStart) / scrollDistance) * 100));
    var rounded = Math.round(percentage);
    progress.setAttribute("aria-valuenow", String(rounded));
    progressValue.style.transform = "scaleX(" + percentage / 100 + ")";
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();
})();
