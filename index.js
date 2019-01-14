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

module.exports = { findColors };
