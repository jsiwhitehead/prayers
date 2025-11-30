// const processLinesContent = ({ text, lines }: LinesContent): string =>
//   [...lines, text.length]
//     .map((end, i, arr) => {
//       const start = i === 0 ? 0 : arr[i - 1]! + 1;
//       return text.slice(start, end).trim();
//     })
//     .join("\n");

// const simplified = prayers.map(({ prayer, content }) => {
//   const filtered = content.filter((c) => {
//     if (typeof c === "string") return true;
//     if (isLines(c)) return true;
//     if (isInfo(c)) {
//       //   return c.text.startsWith("He is") || c.text.startsWith("In the name");
//       return true;
//     }
//     return false;
//   });

//   return {
//     prayer,
//     content: filtered,
//   };

//   //   const textParts = filtered.map((c) => {
//   //     if (typeof c === "string") return c;
//   //     if (isInfo(c)) return c.text;
//   //     if (isLines(c)) return processLinesContent(c);
//   //     return "";
//   //   });

//   //   return {
//   //     prayer,
//   //     text: textParts.join("\n\n"),
//   //   };
// });

// REMOVED
// Copy of Long Obligatory Prayer
// "Provide for the speedy growth of the Tree of Thy divine Unity"
// "Render victorious Thy forbearing servants"
// "Consecrate Thou, O my God, the whole of this Tree unto Him"
