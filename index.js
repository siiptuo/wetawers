const path = require("path");
const parseColor = require("parse-color");
const gonzales = require("gonzales-pe");

function parseFile(filename, resolver) {
  const parseTree = gonzales.parse(resolver(filename), { syntax: "scss" });
  let result = [
    {
      filename,
      parseTree
    }
  ];
  const directory = path.dirname(filename);
  parseTree.forEach("atrule", node => {
    if (node.content[0].content[0].content !== "import") return;
    const file = node.content[2].content.slice(1, -1);
    result = [...parseFile(path.join(directory, file), resolver), ...result];
  });
  return result;
}

function _findColors(node, filename) {
  if (node.type == "color") {
    const content = "#" + node.content;
    return {
      rgba: parseColor(content).rgba,
      content,
      filename,
      start: node.start,
      end: node.end
    };
  }
  if (
    node.type == "function" &&
    ["rgb", "rgba", "hsl", "hsla"].includes(node.content[0].content)
  ) {
    const content = node.toString();
    return [
      {
        rgba: parseColor(content).rgba,
        content,
        filename,
        start: node.start,
        end: node.end
      }
    ];
  }
  if (Array.isArray(node.content)) {
    return node.content.map(child => _findColors(child, filename)).flat();
  }
  return [];
}

function findColors(parseTree) {
  return parseTree
    .map(item => _findColors(item.parseTree, item.filename))
    .flat();
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
