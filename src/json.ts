import { writeFileSync } from "node:fs";
import rawPrayers from "../prayers.json" assert { type: "json" };

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

const prayers = rawPrayers.map(({ prayer, content }) => ({
  prayer,
  content,
})) as Prayer[];

const categoryTests: Record<string, (string | RegExp)[]> = {
  Particular: [
    "america",
    "george",
    "mecca",
    "washington",
    "of akka",
    "baghdad",
    "land of iraq",
    " ali ",
    "mirza",
    "purest branch",
    "this tree",
    "down the bayan",
    "great prison",
    "revealing thy cause",
    "i am cast",
    "me to be cast",
    "me and this servant",
    "in a mountain",
    "the exile",
    "one slave",
    /this (association|congregation|prison|mountain|city)/,
  ],
  Obligatory: ["created me to know", "whoso wisheth"],
  Visitation: ["anniversaries"],
  "Long Healing Prayer": ["he is the healer"],
  "Ayyám‑i‑Há": ["ayyam"],
  Riḍván: ["ridvan"],
  "Naw‑Rúz": ["nawruz", "that day", "festival"],
  Fast: ["the fast"],
  Meeting: ["spiritual assembly", "councilchamber"],
  "Ḥuqúqu’lláh": ["huquq", "contribute", "desireth to offer"],
  Temple: ["edifice", "mashriquladhkar", "this temple"],
  Nations: ["government", "the rulers", /heart of the (king|sovereign)/],
  Departed: [
    "prayer for the dead",
    "newly arrived",
    "returned that spreading ray",
    "noble soul",
    "summon back",
    "abandoned this mortal life",
    /ascended (to|unto)/,
  ],
  Gathering: [
    "this assemblage",
    "this gathering",
    "this meeting",
    "this assembly",
    "gathered here",
  ],
  "Morning and Evening": [
    "risen this morning",
    "i have set out",
    "seeketh to sleep",
    "this dark night",
    /wakened (in|this)/,
  ],
  "Family and Parents": [
    "this family",
    "loving mother",
    "father and",
    /parents (and|this)/,
  ],
  Marriage: ["married", "marriage", " wed ", " two "],
  Married: [
    "childless",
    "pangs of labour",
    "husband",
    "my womb",
    "bless the gift",
    "for the blessing",
  ],
  "Children and Youth": [
    "the children",
    "a child",
    "o beloved child",
    "sapling",
    "suckling",
    "seedlings",
    "infant",
    "twig",
    "this plant",
    "tiny seed",
    "this youth",
    /these(?:\s+\w+){0,2}\s+children/,
    /we are(?:\s+\w+)?\s+children/,
    /this(?:\s+\w+)?\s+child/,
    /tender (seedling|plant)/,
    /(thou|this) little/,
  ],
  Women: [
    "daughter",
    "maidservants who",
    "maidservant was",
    /(?<!(servants and |bondsmen and ))thy handmaid/,
    /(this|thine|the) handmaid/,
  ],
};

const categoryEntries = Object.entries(categoryTests);

const categorised: Record<string, Prayer[]> = Object.fromEntries(
  categoryEntries.map(([category]) => [category, [] as Prayer[]])
);

const uncategorised: Prayer[] = [];

for (const prayer of prayers) {
  const text = prayer.content
    .map((c) => (typeof c === "string" ? c : c.text))
    .join(" ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z ]/g, "");

  let assigned = false;

  if (text.length < 11000) {
    for (const [category, tests] of categoryEntries) {
      const matchesCategory = tests.some((test) =>
        test instanceof RegExp ? test.test(text) : text.includes(test)
      );

      if (matchesCategory) {
        categorised[category]!.push(prayer);
        assigned = true;
        break;
      }
    }
  } else if (text.includes("observe the fast")) {
    categorised["Fast"]!.push(prayer);
    assigned = true;
    break;
  } else if (text.includes("bayan")) {
    categorised["Particular"]!.push(prayer);
    assigned = true;
    break;
  }

  if (!assigned) uncategorised.push(prayer);
}

const adversityTests: Record<string, (string | RegExp)[]> = {
  "Oppression and Persecution": [
    "enemies",
    "adversaries",
    "the wicked",
    "infidel",
    "infidels",
    "have repudiated",
    "repudiate",
    "transgressed",
    "oppressor",
    "oppressors",
    "aggressor",
    "evildoers",
    "cruelty",
    "cursed",
    "enmity",
    "sedition",
    "mischief",
    "swords",
    "onslaught of the people",
  ],
  "Protection and Forgiveness": [
    "adversities",
    "adversity",
    "tribulations",
    "trials",
    "violent tests",
    "difficulties",
    "sword",
    "when sorrows",
    "seized with alarm",
  ],
  "Teaching and Service": [
    "exalt thy",
    "speak forth",
    "to spread",
    "to teach",
    "to proclaim",
    "to enrapture",
    "to deliver them",
    "summon all",
    "speak out",
    "speak of",
    "my speech",
    "unloose his tongue",
    "with thy mention",
    "called out",
    "promotion",
    "diffusion",
    "proffer",
    "to heal",
    "leaders unto thee",
    "give the glad tidings",
    "illumination of divine teachings",
    "them to prevail",
    "proclaim thy",
    "raise thy",
    "lamps",
    "banner",
    "emblems",
    "arise",
    "arisen",
    "affairs",

    "recognise thy unity",
    "uncover before them",
    "brighten their eyes",
    "unlock the gates",
    "enable all the peoples",
    "faces of thy servants",
    "call thou to life",
    "inform the hearts",
    "dispel the mists",
    "directing their gaze",
    "power to approach",
    "save them",
    "quicken them",
    "guide thy servants",
    "repent before the door",
  ],
  "Protection and Forgiveness 2": [
    "trespasses",
    "wash away",
    "sinner",
    "sinners",
    "wretched state",
    "forgive them",

    "shield",
    "protect",
    "protection",
    "safe",
    "shelter",
    "no harm",

    "remedy",
    "affliction",
    "balm",

    "misery",
    "grief",
    "sorrow",
    "gloom",
    "anguish",
    "corrupt",
    "passion",
  ],
  "Bestowal and Nearness": [
    /bestow (upon|on|thy)/,
    "bestowed",
    "give",
    "adorn",
    "attire",
    "clothe",
    "rain",
    "supply",
    "gladden",
    "destine",
    "vivified",
  ],
  "Praise and Devotion": [
    "comprehend",
    "powerlessness",
    "perplexed",
    "failed to know",

    "o god my god my beloved",
    "all thy lights",
    "god sufficeth",
    "blessed is the spot",
    "god testifieth",
    "thine in truth",
    "whomsoever thou willest",
    "sacred scriptures",
    "show thyself",
    "unity of its peoples",
  ],
};

const adversityEntries = Object.entries(adversityTests);

const adversityCategorised: Record<string, Prayer[]> = Object.fromEntries(
  adversityEntries.map(([level]) => [level, [] as Prayer[]])
);

for (const prayer of uncategorised) {
  const text = prayer.content
    .map((c) => (typeof c === "string" ? c : c.text))
    .join(" ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z ]/g, "");

  let assignedLevel = false;

  for (const [level, tests] of adversityEntries) {
    const matchesLevel = tests.some((test) => {
      if (test instanceof RegExp) return test.test(text);
      return new RegExp(`\\b${test}\\b`).test(text);
    });

    if (matchesLevel) {
      adversityCategorised[level]!.push(prayer);
      assignedLevel = true;
      break;
    }
  }

  if (!assignedLevel) {
    adversityCategorised["Bestowal and Nearness"]!.push(prayer);
  }
}

for (const cat of ["Teaching and Service", "Bestowal and Nearness"]) {
  for (const p of adversityCategorised[cat]!) {
    p.content = p.content.filter((a) => {
      if (typeof a !== "string" && "type" in a && a.type === "info") {
        return false;
      }
      return true;
    });
  }
}

adversityCategorised["Protection and Forgiveness"]?.push(
  ...adversityCategorised["Protection and Forgiveness 2"]!
);
delete adversityCategorised["Protection and Forgiveness 2"];

const getContentText = (c: Content): string => {
  if (typeof c === "string") return c;
  return c.text;
};

const getPrayerTextLength = (p: Prayer): number =>
  p.content.reduce((sum, item) => sum + getContentText(item).length, 0);

adversityCategorised["Protection and Forgiveness"] = [
  ...adversityCategorised["Protection and Forgiveness"]!,
].sort((a, b) => getPrayerTextLength(a) - getPrayerTextLength(b));

writeFileSync(
  new URL("./prayers-categorised.json", import.meta.url),
  JSON.stringify(categorised, null, 2),
  "utf8"
);

writeFileSync(
  new URL("./prayers-adversity.json", import.meta.url),
  JSON.stringify(adversityCategorised, null, 2),
  "utf8"
);

console.log(
  Object.entries(adversityCategorised).map((x) => [x[0], x[1].length])
);
