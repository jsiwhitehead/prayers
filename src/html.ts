// build.js
import fs from "node:fs/promises";
import path from "node:path";
import prayersJson from "./prayers-subthemed.json" assert { type: "json" };

type TypeContent = {
  type: "info" | "call";
  text: string;
};

type LinesContent = {
  text: string;
  lines: number[];
};

type Content = string | TypeContent | LinesContent;

type Prayer = {
  prayer: "Bahá’u’lláh" | "The Báb" | "‘Abdu’l‑Bahá";
  content: Content[];
};

const prayersByCategory = prayersJson as Record<string, Prayer[]>;

const OUTPUT_FILE = path.join(process.cwd(), "./site/index.html");
const PREVIEW_MAX_CHARS = 200;

function escapeHtml(str: string) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function slugify(str: string) {
  return String(str)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getContentText(item: Content) {
  if (typeof item === "string") return item;
  if (item && typeof item === "object" && "text" in item) return item.text;
  return "";
}

function getPreviewText(contentArray: Content[], maxChars: number) {
  if (!contentArray.length) return "";

  let preview = "";
  let truncated = false;

  for (const item of contentArray) {
    const text = getContentText(item).trim();
    if (!text) continue;

    const separator = preview ? " " : "";
    const candidate = preview + separator + text;

    if (candidate.length <= maxChars) {
      preview = candidate;
      continue;
    }

    // Need to truncate — do it by words, not characters
    const remaining = maxChars - preview.length - separator.length;
    if (remaining > 0) {
      const words = text.split(/\s+/);
      let built = "";
      for (const w of words) {
        const tentative = (built ? built + " " : "") + w;
        if (tentative.length > remaining) break;
        built = tentative;
      }
      if (built) {
        preview = preview + separator + built;
      }
    }

    truncated = true;
    break;
  }

  if (!preview) return "";

  return truncated ? preview.trim() + "…\n…" : preview;
}

function renderContentParagraph(item: Content) {
  if (typeof item === "string") {
    return `<p>${escapeHtml(item)}</p>`;
  }

  if (!item || typeof item !== "object") {
    return "";
  }

  const text = "text" in item ? item.text : "";
  const safeText = escapeHtml(text);

  if ("type" in item && item.type) {
    const type = escapeHtml(item.type);
    return `<p class="content-${type}">${safeText}</p>`;
  }

  if ("lines" in item && Array.isArray(item.lines)) {
    const linesAttr = escapeHtml(item.lines.join(","));
    return `<p class="content-lines" data-lines="${linesAttr}">${safeText}</p>`;
  }

  return `<p>${safeText}</p>`;
}

function renderPrayerArticle(
  prayer: Prayer,
  prayerIndex: number, // original array index (for IDs)
  categorySlug: string,
  displayIndex: number // 1-based number within the author group
) {
  const author = prayer.prayer;
  const prayerId = `${categorySlug}-p${prayerIndex}`;

  const previewText = getPreviewText(prayer.content || [], PREVIEW_MAX_CHARS);
  const previewHtml = `<p>${escapeHtml(previewText)}</p>`;
  const bodyParas = (prayer.content || [])
    .map(renderContentParagraph)
    .join("\n");

  return `
    <article
      class="prayer"
      data-prayer-id="${escapeHtml(prayerId)}"
      data-category="${escapeHtml(categorySlug)}"
      data-author="${escapeHtml(author)}"
      data-number="${escapeHtml(String(displayIndex))}"
    >
      <button
        class="prayer-toggle"
        type="button"
        aria-expanded="false"
        aria-controls="body-${escapeHtml(prayerId)}"
      >
        <div class="prayer-inner">
          <div class="prayer-number" aria-hidden="true">
            ${escapeHtml(String(displayIndex))}.
          </div>

          <div class="prayer-content">
            <div class="prayer-preview">${previewHtml}</div>

            <div class="prayer-body" id="body-${escapeHtml(prayerId)}" hidden>
            ${bodyParas}
            </div>
          </div>
        </div>
      </button>
    </article>
  `;
}

function renderCategorySection(categoryName: string, prayers: Prayer[]) {
  const categorySlug = slugify(categoryName);

  // Group prayers by author
  const byAuthor = new Map<string, { prayer: Prayer; index: number }[]>();
  for (let i = 0; i < prayers.length; i++) {
    const p = prayers[i]!;
    const author = p.prayer || "Unknown";
    if (!byAuthor.has(author)) byAuthor.set(author, []);
    byAuthor.get(author)!.push({ prayer: p, index: i });
  }

  // Render author sections in a fixed order if you want
  const authorOrder = ["Bahá’u’lláh", "The Báb", "‘Abdu’l-Bahá"];
  const authorsSorted = [
    ...authorOrder.filter((a) => byAuthor.has(a)),
    ...[...byAuthor.keys()].filter((a) => !authorOrder.includes(a)),
  ];

  // Global counter within this category
  let counter = 0;

  const authorSections = authorsSorted
    .map((author) => {
      const entries = byAuthor.get(author)!;
      const itemsHtml = entries
        .map(({ prayer, index }) =>
          renderPrayerArticle(
            prayer,
            index, // keep original index for IDs
            categorySlug,
            ++counter // global 1-based numbering across authors
          )
        )
        .join("\n");

      return `
      <section class="author-group" data-author="${escapeHtml(author)}">
        <h2 class="author-heading">${escapeHtml(author)}</h2>
        <div class="prayers-list">
          ${itemsHtml}
        </div>
      </section>
    `;
    })
    .join("\n");

  return `
    <section class="category-section" data-category="${escapeHtml(
      categorySlug
    )}">
      <h1 class="category-title">${escapeHtml(categoryName)}</h1>
      ${authorSections}
    </section>
  `;
}

async function build() {
  const categoryNames = Object.keys(prayersByCategory);
  if (!categoryNames.length) {
    console.error("No categories found in prayers-subthemed.json");
    return;
  }

  const firstCategorySlug = slugify(categoryNames[0]!);

  const sidebarLinksHtml = categoryNames
    .map((name, idx) => {
      const slug = slugify(name);
      const activeClass = idx === 0 ? " is-active" : "";
      return `
        <button
          class="category-link${activeClass}"
          type="button"
          data-category="${escapeHtml(slug)}"
        >
          ${escapeHtml(name)}
        </button>
      `;
    })
    .join("\n");

  const categorySectionsHtml = categoryNames
    .map((name, idx) => {
      const sectionHtml = renderCategorySection(
        name,
        prayersByCategory[name] || []
      );
      // add is-active class to the first category section
      if (idx === 0) {
        return sectionHtml.replace(
          'class="category-section"',
          'class="category-section is-active"'
        );
      }
      return sectionHtml;
    })
    .join("\n");

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Prayers</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <div class="app">
      <aside class="sidebar">
        <div class="sidebar-inner">
          <h1 class="app-title">Prayers</h1>
          <nav class="category-nav">
            ${sidebarLinksHtml}
          </nav>
        </div>
      </aside>

      <main class="content">
        ${categorySectionsHtml}
      </main>
    </div>

    <script src="main.js" defer></script>
  </body>
</html>
`;

  await fs.writeFile(OUTPUT_FILE, html, "utf8");
  console.log(`Wrote ${OUTPUT_FILE}`);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
