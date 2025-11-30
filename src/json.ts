import { writeFileSync } from "node:fs";
import rawPrayers from "../prayers.json" assert { type: "json" };

type InfoContent = {
  type: "info";
  text: string;
};

type LinesContent = {
  text: string;
  lines: number[];
};

type Content = string | InfoContent | LinesContent;

type Prayer = {
  prayer: "Bahá’u’lláh" | "The Báb" | "‘Abdu’l-Bahá";
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
  "Trials and Adversity": [
    "adversities",
    "adversity",
    "tribulations",
    "trials",
    "tests",
    "difficulties",
    "sword",
    "when sorrows",
    "seized with alarm",
  ],
  "Sorrow and Anguish": [
    "grief",
    "anguish",
    "misery",
    "despair",
    "sorrow",
    "affliction",
    "gloom",
  ],
  Unity: [
    /unite (us|all|in|together|and)/,
    "unity of its peoples",
    "enable all the peoples",
    "embrace",
    "sea of thy oneness",
  ],
  "Sin and Transgression": [
    "sins",
    "sin",
    "trespasses",
    "forgive",
    "corrupt",
    "repugnant",
  ],
  "Protection and Guidance": [
    "shield",
    "armour",
    "onslaught",
    "protect",
    "safe",
  ],
  Teaching: [
    "exalt thy",
    "speak forth",
    "to spread",
    "to teach",
    "to proclaim",
    "summon all",
    "speak out",
    "speak of",
    "called out",
    "promotion",
    "proffer",
    "call in",
    "illumination of divine teachings",
  ],
  Service: ["serve", "serving", "service", "affairs"],
  Inaccessible: [
    "comprehend",
    "comprehended",
    "sing",
    "fathom",
    "perplexed",
    "make mention",
  ],
  Recognising: [
    "return unto thee",
    "faces of thy servants",
    "gather together",
    "in every heart",
    "inform the hearts",
    "dispel the mists",
    "directing their gaze",
    "power to approach",
    "save them",
    "quicken them",
  ],
  Illumination: [
    "lamps",
    "rays",
    "minaret",
    "empower",
    "signs of",
    "to deliver them",
  ],
  Victory: ["prevail", "render"],
  "Spiritual Growth": ["adorn", "attire", "grow", "clothe thy", "pure heart"],
  "Inspiration and Aid": [
    "enkindlement",
    "enkindled",
    "new life",
    "aid",
    "inspire",
    "lead",
    "revived",
    "vivified",
    "open the eyes",
    "walk in glory",
    "become fountains",
    "infuse",
  ],
  Blessing: [
    "ordain",
    "attain",
    "grant",
    "gifts",
    "show me",
    "sanctify",
    "detached",
    "presence my drink",
    "sufficing",
    "withdrawn",
    "detach",
    "affections",
    "naught",
    "remembrance",
    "clung",
    "hearkened",
  ],
  "Glory and Devotion": [""],
};

const adversityEntries = Object.entries(adversityTests);

const adversityCategorised: Record<string, Prayer[]> = Object.fromEntries(
  adversityEntries.map(([level]) => [level, [] as Prayer[]])
);

const adversityUncategorised: Prayer[] = [];

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
    adversityUncategorised.push(prayer);
  }
}

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
