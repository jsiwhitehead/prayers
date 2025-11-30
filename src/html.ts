// generate.ts

// ---- Types matching your data ----

const CATEGORY_ORDER = [
  "Praise and Devotion",
  "Bestowal and Nearness",
  "Teaching and Service",
  "Protection and Forgiveness",
];

const AUTHOR_ORDER = ["Bahá’u’lláh", "The Báb", "‘Abdu’l‑Bahá"];

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

type PrayersByCategory = Record<string, Prayer[]>;

// ---- Paths ----

const PRAYERS_JSON_PATH = "./src/prayers-adversity.json";
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
      <h3 class="prayer-title">${escapeHtml(prayer.prayer)}</h3>
      <div class="prayer-content">
        ${contentHtml}
      </div>
    </article>
  `;
}

function renderCategory(name: string, prayers: Prayer[]): string {
  const sortedPrayers = [...prayers].sort((a, b) => {
    const indexA = AUTHOR_ORDER.indexOf(a.prayer);
    const indexB = AUTHOR_ORDER.indexOf(b.prayer);
    return indexA - indexB;
  });

  const prayersHtml = sortedPrayers.map(renderPrayer).join("\n");

  return `
    <details class="category">
      <summary class="category-title">${escapeHtml(name)}</summary>
      ${prayersHtml}
    </details>
  `;
}

function renderPage(prayersByCategory: PrayersByCategory): string {
  const categoriesHtml = CATEGORY_ORDER.map((categoryName) => {
    const prayers = prayersByCategory[categoryName] ?? [];
    return renderCategory(categoryName, prayers);
  }).join("\n");

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
        <h1 class="page-title">Prayers on Adversity</h1>
        <p class="page-subtitle">
          Categorised by theme, each section can be expanded or collapsed.
        </p>
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
  const data = JSON.parse(jsonText) as PrayersByCategory;

  const html = renderPage(data);
  await Bun.write(OUTPUT_HTML_PATH, html);

  console.log(`Wrote ${OUTPUT_HTML_PATH}`);
}

main().catch((err) => {
  console.error("Error generating HTML:", err);
  process.exit(1);
});
