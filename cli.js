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

// padStart not supported in Node 6
function leftPad2(str) {
  return str.length == 1 ? "0" + str : str;
}

function formatColor(rgba) {
  const [r, g, b] = rgba;
  return chalk
    .bgRgb(r, g, b)
    .keyword(brightness(rgba) < 128 ? "white" : "black")(
    "#" +
      leftPad2(r.toString(16)) +
      leftPad2(g.toString(16)) +
      leftPad2(b.toString(16))
  );
}

const file = process.argv[2];
const parseTree = parseFile(file, resolver);
const colors = findColors(parseTree);
const duplicates = findDuplicates(colors);

if (parseTree.some(item => item.errors.length > 0)) {
  console.log("Errors:");
  for (const item of parseTree) {
    for (const error of item.errors) {
      console.log(
        "- " +
          item.filename +
          ":" +
          error.start.line +
          ":" +
          error.start.column +
          ": " +
          chalk.red(error.message)
      );
    }
  }
  console.log();
}

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
}

console.log(
  "Processed " +
    parseTree.length +
    " file" +
    (parseTree.length === 1 ? "" : "s")
);
console.log(
  "Found " +
    duplicates.length +
    " duplicated color" +
    (duplicates.length === 1 ? "" : "s")
);
console.log();

if (duplicates.length > 0) {
  process.exit(1);
}
