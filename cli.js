#!/usr/bin/env node

const fs = require("fs");
const { parseFile, findColors, findDuplicates } = require("./");

const resolver = {
  exists(file) {
    return fs.existsSync(file);
  },
  read(file) {
    return fs.readFileSync(file, "utf8");
  }
};

function formatColor(rgba) {
  return (
    "#" +
    rgba[0].toString(16).padStart(2, "0") +
    rgba[1].toString(16).padStart(2, "0") +
    rgba[2].toString(16).padStart(2, "0")
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
