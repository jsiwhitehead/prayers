import { writeFileSync } from "node:fs";
import rawPrayers from "./prayers-themed.json" assert { type: "json" };

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

const prayers = rawPrayers as Record<string, Prayer[]>;

const nearnessTests: Record<string, (string | RegExp)[]> = {
  Collective: [
    "unite",
    "we",
    "us",
    "gather",
    "everyone",
    /(suffer|fashion|grant|support|draw|deliver) them/,
    /thy loved ones (in|with|therein)/,
    /these (men|trees|souls|are)/,
  ],
  Individual: [""],
};

const nearnessEntries = Object.entries(nearnessTests);

const nearnessCategorised: Record<string, Prayer[]> = Object.fromEntries(
  nearnessEntries.map(([category]) => [category, [] as Prayer[]])
);

for (const prayer of prayers["Nearness"]!) {
  const text = prayer.content
    .map((c) => (typeof c === "string" ? c : c.text))
    .join(" ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z ]/g, "");

  for (const [category, tests] of nearnessEntries) {
    const matchesCategory = tests.some((test) => {
      if (test instanceof RegExp) return test.test(text);
      return new RegExp(`\\b${test}\\b`).test(text);
    });

    if (matchesCategory) {
      nearnessCategorised[category]!.push(prayer);
      break;
    }
  }
}

const teachingTests: Record<string, (string | RegExp)[]> = {
  Humanity: [
    "unite",
    "open the eyes",
    "faces of thy servants",
    "save them",
    "return unto thee",
    "uncover before them",
    "enable all the peoples",
    "call thou to life",
    "dispel the mists",
    "directing their gaze",
    "power to approach",
    "quicken them",
    "declare thy oneness",
    "speedy growth",
    "not to deprive",
    "waters of thy unity",
    "lay bare thy mysteries",
  ],
  Collective: [
    "us",
    /help (them|thou)/,
    /these (are|souls|servants)/,
    /(assist|aid)(?:\s+\w+){0,2}\s+servants/,
    /(assist|attire|empower) them/,
    "assist thy",
    "all arise",
    "accept from",
    "acceptable unto thee",
  ],
  Individual: [""],
};

const teachingEntries = Object.entries(teachingTests);

const teachingCategorised: Record<string, Prayer[]> = Object.fromEntries(
  teachingEntries.map(([category]) => [category, [] as Prayer[]])
);

for (const prayer of prayers["Teaching"]!) {
  const text = prayer.content
    .map((c) => (typeof c === "string" ? c : c.text))
    .join(" ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z ]/g, "");

  for (const [category, tests] of teachingEntries) {
    const matchesCategory = tests.some((test) => {
      if (test instanceof RegExp) return test.test(text);
      return new RegExp(`\\b${test}\\b`).test(text);
    });

    if (matchesCategory) {
      teachingCategorised[category]!.push(prayer);
      break;
    }
  }
}

const aidTests: Record<string, (string | RegExp)[]> = {
  Collective: [
    "us",
    "we set",
    /(on|upon) these/,
    /(give|cause|make|help|draw|satisfy) them/,
    "such among",
    /their (hardship|eyes|hearts)/,
    "all abide",
    "source of bounty",
  ],
  Individual: [""],
};

const aidEntries = Object.entries(aidTests);

const aidCategorised: Record<string, Prayer[]> = Object.fromEntries(
  aidEntries.map(([category]) => [category, [] as Prayer[]])
);

for (const prayer of prayers["Aid"]!) {
  const text = prayer.content
    .map((c) => (typeof c === "string" ? c : c.text))
    .join(" ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z ]/g, "");

  for (const [category, tests] of aidEntries) {
    const matchesCategory = tests.some((test) => {
      if (test instanceof RegExp) return test.test(text);
      return new RegExp(`\\b${test}\\b`).test(text);
    });

    if (matchesCategory) {
      aidCategorised[category]!.push(prayer);
      break;
    }
  }
}

const praiseCategorised = {
  God: prayers["Praise"],
  Humanity: teachingCategorised["Humanity"],
};
delete teachingCategorised["Humanity"];

const result = {
  Praise: praiseCategorised,
  Nearness: nearnessCategorised,
  Teaching: teachingCategorised,
  Aid: aidCategorised,
};

writeFileSync(
  new URL("./prayers-subthemed.json", import.meta.url),
  JSON.stringify(result, null, 2),
  "utf8"
);
