import { apiInitializer } from "discourse/lib/api";
import { scheduleOnce } from "@ember/runloop";

function parseCategoryIds() {
  const raw = settings.target_categories || [];
  const list = Array.isArray(raw)
    ? raw
    : raw
        .toString()
        .split("|")
        .map((value) => value.trim())
        .filter((value) => value.length > 0);
  return list
    .map((id) => parseInt(id, 10))
    .filter((id) => Number.isInteger(id));
}

function getTopicModel(api) {
  const controller = api.container.lookup("controller:topic");
  return controller?.model;
}

function getPostStream(topic) {
  return topic?.postStream || topic?.post_stream;
}

function getFirstPostElement() {
  return document.querySelector(
    '[data-post-number="1"].topic-post, article[data-post-number="1"], [data-post-number="1"]',
  );
}

function isTargetTopic(topic, targetCategoryIds) {
  if (!topic || !targetCategoryIds.length) {
    return false;
  }
  const categoryId = topic.category_id || topic.categoryId;
  return targetCategoryIds.includes(categoryId);
}

function getFirstPost(topic) {
  const postStream = getPostStream(topic);
  const posts = postStream?.posts;
  return posts?.[0];
}

function updateFirstPostMeta(topic) {
  const firstPostEl = getFirstPostElement();
  if (!firstPostEl) {
    return;
  }

  firstPostEl.classList.add("wiki-topic-first");
  const names = firstPostEl.querySelector(
    ".topic-meta-data .names.trigger-user-card",
  );
  if (!names) {
    return;
  }

  const firstPost = getFirstPost(topic);
  const author =
    firstPost?.name ||
    firstPost?.username ||
    topic?.details?.created_by?.name ||
    topic?.details?.created_by?.username;
  const authorFromDom =
    names
      .querySelector(".username a, .first.username a")
      ?.textContent?.trim() ||
    names.querySelector(".full-name a")?.textContent?.trim();
  const authorName = author || authorFromDom;
  if (!authorName) {
    return;
  }

  const updatedBy =
    firstPost?.last_editor_name ||
    firstPost?.last_editor_username ||
    topic?.details?.last_poster?.name ||
    topic?.details?.last_poster?.username;

  const metaSignature = `${authorName}|${updatedBy || ""}`;
  if (
    names.dataset.wikiMetaSignature === metaSignature &&
    names.classList.contains("wiki-topic-meta")
  ) {
    return;
  }

  names.dataset.wikiMetaSignature = metaSignature;
  names.classList.add("wiki-topic-meta");
  while (names.firstChild) {
    names.removeChild(names.firstChild);
  }

  const authorIcon = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg",
  );
  authorIcon.setAttribute("class", "wiki-meta-author-icon");
  authorIcon.setAttribute("viewBox", "0 0 640 640");
  authorIcon.setAttribute("aria-hidden", "true");
  const authorPath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path",
  );
  authorPath.setAttribute(
    "d",
    "M128 64C92.7 64 64 92.7 64 128L64 512C64 547.3 92.7 576 128 576L308 576C285.3 544.5 272 505.8 272 464C272 363.4 349.4 280.8 448 272.7L448 234.6C448 217.6 441.3 201.3 429.3 189.3L322.7 82.7C310.7 70.7 294.5 64 277.5 64L128 64zM389.5 240L296 240C282.7 240 272 229.3 272 216L272 122.5L389.5 240zM464 608C543.5 608 608 543.5 608 464C608 384.5 543.5 320 464 320C384.5 320 320 384.5 320 464C320 543.5 384.5 608 464 608zM480 400L480 448L528 448C536.8 448 544 455.2 544 464C544 472.8 536.8 480 528 480L480 480L480 528C480 536.8 472.8 544 464 544C455.2 544 448 536.8 448 528L448 480L400 480C391.2 480 384 472.8 384 464C384 455.2 391.2 448 400 448L448 448L448 400C448 391.2 455.2 384 464 384C472.8 384 480 391.2 480 400z",
  );
  authorIcon.appendChild(authorPath);

  names.appendChild(authorIcon);
  names.append(document.createTextNode(` ${authorName}`));

  if (updatedBy && updatedBy !== authorName) {
    names.append(document.createTextNode(", "));
    const updated = document.createElement("span");
    updated.className = "wiki-meta-updated";

    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("class", "wiki-meta-updated-icon");
    icon.setAttribute("viewBox", "0 0 640 640");
    icon.setAttribute("aria-hidden", "true");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      "M128.1 64C92.8 64 64.1 92.7 64.1 128L64.1 512C64.1 547.3 92.8 576 128.1 576L274.3 576L285.2 521.5C289.5 499.8 300.2 479.9 315.8 464.3L448 332.1L448 234.6C448 217.6 441.3 201.3 429.3 189.3L322.8 82.7C310.8 70.7 294.5 64 277.6 64L128.1 64zM389.6 240L296.1 240C282.8 240 272.1 229.3 272.1 216L272.1 122.5L389.6 240zM332.3 530.9L320.4 590.5C320.2 591.4 320.1 592.4 320.1 593.4C320.1 601.4 326.6 608 334.7 608C335.7 608 336.6 607.9 337.6 607.7L397.2 595.8C409.6 593.3 421 587.2 429.9 578.3L548.8 459.4L468.8 379.4L349.9 498.3C341 507.2 334.9 518.6 332.4 531zM600.1 407.9C622.2 385.8 622.2 350 600.1 327.9C578 305.8 542.2 305.8 520.1 327.9L491.3 356.7L571.3 436.7L600.1 407.9z",
    );
    icon.appendChild(path);

    updated.appendChild(icon);
    updated.appendChild(document.createTextNode(` ${updatedBy}`));
    names.appendChild(updated);
  }
}

function clearWikiState() {
  document.body.classList.remove("wiki-topic", "wiki-replies-collapsed");
  document.querySelectorAll(".names.wiki-topic-meta").forEach((meta) => {
    meta.classList.remove("wiki-topic-meta");
    delete meta.dataset.wikiMetaSignature;
  });
  document
    .querySelectorAll(".wiki-topic-first")
    .forEach((post) => post.classList.remove("wiki-topic-first"));
}

export default apiInitializer("0.8.7", (api) => {
  const targetCategoryIds = parseCategoryIds();

  const apply = () => {
    scheduleOnce("afterRender", () => {
      const topic = getTopicModel(api);
      if (!isTargetTopic(topic, targetCategoryIds)) {
        clearWikiState();
        return;
      }

      document.body.classList.add("wiki-topic");
      document.body.classList.remove("wiki-replies-collapsed");
      updateFirstPostMeta(topic);
    });
  };

  api.onPageChange(apply);
  api.onAppEvent("post-stream:refresh", apply);
});
