#!/usr/bin/env node

const fs = require("fs");
const gonzales = require("gonzales-pe");
const { findColors, findDuplicates } = require("./");

const file = process.argv[2];
const css = fs.readFileSync(file, "utf8");
const parseTree = gonzales.parse(css);
const colors = findColors(parseTree);
const duplicates = findDuplicates(colors);

function formatColor(rgba) {
  return (
    "#" +
    rgba[0].toString(16).padStart(2, "0") +
    rgba[1].toString(16).padStart(2, "0") +
    rgba[2].toString(16).padStart(2, "0")
  );
}

if (duplicates.length > 0) {
  for (const colors of duplicates) {
    console.log("color " + formatColor(colors[0].rgba) + " duplicated:");
    for (const color of colors) {
      console.log(
        "- " + file + ":" + color.start.line + ":" + color.start.column
      );
    }
    console.log();
  }
  process.exit(1);
}
