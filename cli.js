#!/usr/bin/env node

const fs = require("fs");
const chalk = require("chalk");
const { parseFile, findColors, findDuplicates } = require("./");

const resolver = {
  exists(file) {
    return fs.existsSync(file);
  },
  read(file) {
    return fs.readFileSync(file, "utf8");
  }
};

// Based on: https://www.w3.org/TR/AERT/#color-contrast
// Returns value between 0 and 255.
function brightness([r, g, b]) {
  return (r * 299 + g * 587 + b * 114) / 1000;
}

function formatColor(rgba) {
  const [r, g, b] = rgba;
  return chalk
    .bgRgb(r, g, b)
    .keyword(brightness(rgba) < 128 ? "white" : "black")(
    "#" +
      r.toString(16).padStart(2, "0") +
      g.toString(16).padStart(2, "0") +
      b.toString(16).padStart(2, "0")
  );
}

const file = process.argv[2];
const parseTree = parseFile(file, resolver);
const colors = findColors(parseTree);
const duplicates = findDuplicates(colors);

if (duplicates.length > 0) {
  for (const colors of duplicates) {
    console.log("color " + formatColor(colors[0].rgba) + " duplicated:");
    for (const color of colors) {
      console.log(
        "- " +
          color.filename +
          ":" +
          color.start.line +
          ":" +
          color.start.column
      );
    }
    console.log();
  }
  process.exit(1);
}
