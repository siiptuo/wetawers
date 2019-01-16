const parseColor = require("parse-color");

function findColors(node) {
  if (node.type == "color") {
    const content = "#" + node.content;
    return {
      rgba: parseColor(content).rgba,
      content,
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
        start: node.start,
        end: node.end
      }
    ];
  }
  if (Array.isArray(node.content)) {
    return node.content.map(findColors).flat();
  }
  return [];
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

module.exports = { findColors, compareColors, findDuplicates };
