const path = require("path");
const parseColor = require("parse-color");
const gonzales = require("gonzales-pe");

const colorFunction = /^(rgb|hsl)a?$/;

function parseFile(filename, resolver) {
  const parseTree = gonzales.parse(resolver.read(filename), { syntax: "scss" });
  let result = [
    {
      filename,
      parseTree
    }
  ];
  const directory = path.dirname(filename);
  parseTree.traverseByType("atrule", node => {
    if (node.content[0].content[0].content !== "import") return;
    let file = node.content[2].content.slice(1, -1);
    const parts = path.parse(path.join(directory, file));
    if (parts.ext) {
      file = path.join(directory, file);
    } else {
      const scss = path.format({
        dir: parts.dir,
        name: parts.name,
        ext: ".scss"
      });
      const partial = path.format({
        dir: parts.dir,
        name: "_" + parts.name,
        ext: ".scss"
      });
      const css = path.format({
        dir: parts.dir,
        name: parts.name,
        ext: ".css"
      });
      if (resolver.exists(scss)) {
        file = scss;
      } else if (resolver.exists(partial)) {
        file = partial;
      } else if (resolver.exists(css)) {
        file = css;
      } else {
        throw new Error("unable to resolve: " + file);
      }
    }
    result = [...parseFile(file, resolver), ...result];
  });
  return result;
}

function findColors(parseTree) {
  const colors = [];
  parseTree.forEach(item => {
    item.parseTree.traverse(node => {
      if (node.type == "color") {
        const content = "#" + node.content;
        colors.push({
          rgba: parseColor(content).rgba,
          content,
          filename: item.filename,
          start: node.start,
          end: node.end
        });
      } else if (
        node.type == "function" &&
        node.content[0].content.match(colorFunction)
      ) {
        const content = node.toString();
        colors.push({
          rgba: parseColor(content).rgba,
          content,
          filename: item.filename,
          start: node.start,
          end: node.end
        });
      }
    });
  });
  return colors;
}

function compareColors(a, b) {
  return Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
}

function findDuplicates(colors) {
  const duplicates = [];
  for (let i = 0; i < colors.length; i++) {
    const matches = colors.splice(0, 1);
    for (let j = 0; j < colors.length; ) {
      if (compareColors(matches[0].rgba, colors[j].rgba) < 5) {
        matches.push(colors.splice(j, 1)[0]);
      } else {
        j++;
      }
    }
    if (matches.length > 1) {
      duplicates.push(matches);
    }
  }
  return duplicates;
}

module.exports = { parseFile, findColors, compareColors, findDuplicates };
