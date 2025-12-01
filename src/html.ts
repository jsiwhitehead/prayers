// generate.ts

// ---- Types matching your data ----

const AUTHOR_ORDER = ["Bahá’u’lláh", "The Báb", "‘Abdu’l-Bahá"];

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
  prayer: "Bahá’u’lláh" | "The Báb" | "‘Abdu’l-Bahá";
  content: Content[];
};

// Inner layer: category → list of prayers
type PrayersByCategory = Record<string, Prayer[]>;

// Outer layer: outer category → inner categories
type NestedPrayersByCategory = Record<string, PrayersByCategory>;

// ---- Paths ----

const PRAYERS_JSON_PATH = "./src/prayers-subthemed.json";
const OUTPUT_HTML_PATH = "./src/index.html";

// ---- Helpers ----

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function contentToText(item: Content): string {
  if (typeof item === "string") return item;
  if (item && typeof item === "object" && "text" in item) return item.text;
  return "";
}

// ---- Render functions ----

function renderPrayer(prayer: Prayer): string {
  const contentHtml = prayer.content
    .map((item) => {
      const text = contentToText(item).trim();
      if (!text) return "";
      return `<p>${escapeHtml(text)}</p>`;
    })
    .filter(Boolean)
    .join("\n");

  return `
    <article class="prayer">
      <div class="prayer-content">
        ${contentHtml}

        <p class="prayer-author">—${escapeHtml(prayer.prayer)}</p>
      </div>
    </article>
  `;
}

function renderInnerCategory(name: string, prayers: Prayer[]): string {
  const sortedPrayers = [...prayers].sort((a, b) => {
    const indexA = AUTHOR_ORDER.indexOf(a.prayer);
    const indexB = AUTHOR_ORDER.indexOf(b.prayer);

    const safeIndexA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
    const safeIndexB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;

    return safeIndexA - safeIndexB;
  });

  const prayersHtml = sortedPrayers.map(renderPrayer).join("\n");

  return `
    <details class="category">
      <summary class="category-title">${escapeHtml(name)}</summary>
      ${prayersHtml}
    </details>
  `;
}

function renderOuterCategory(
  outerName: string,
  innerCategories: PrayersByCategory
): string {
  const innerHtml = Object.entries(innerCategories)
    .map(([innerName, prayers]) => renderInnerCategory(innerName, prayers))
    .join("\n");

  return `
    <section class="category-group">
      <h2 class="category-group-title">${escapeHtml(outerName)}</h2>
      ${innerHtml}
    </section>
  `;
}

function renderPage(prayersByOuterCategory: NestedPrayersByCategory): string {
  const categoriesHtml = Object.entries(prayersByOuterCategory)
    .map(([outerName, innerCategories]) =>
      renderOuterCategory(outerName, innerCategories)
    )
    .join("\n");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Prayers – Adversity</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link href="./styles.css" rel="stylesheet" />
  </head>
  <body>
    <main class="page">
      <header class="page-header">
        <h1 class="page-title">Bahá’í Prayers</h1>
      </header>
      <div id="app">
        ${categoriesHtml}
      </div>
    </main>
  </body>
</html>`;
}

// ---- Main ----

async function main() {
  const file = Bun.file(PRAYERS_JSON_PATH);
  const jsonText = await file.text();
  const data = JSON.parse(jsonText) as NestedPrayersByCategory;

  const html = renderPage(data);
  await Bun.write(OUTPUT_HTML_PATH, html);

  console.log(`Wrote ${OUTPUT_HTML_PATH}`);
}

main().catch((err) => {
  console.error("Error generating HTML:", err);
  process.exit(1);
});
