#!/usr/bin/env node

const fs = require("fs");
const gonzales = require("gonzales-pe");
const { findColors } = require("./");

const css = fs.readFileSync(process.argv[2], "utf8");
const parseTree = gonzales.parse(css);
console.log(findColors(parseTree));
