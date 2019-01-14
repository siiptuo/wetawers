function findColors(node) {
  if (node.type == "color") {
    return [node.content];
  }
  if (
    node.type == "function" &&
    ["rgb", "rgba", "hsl", "hsla"].includes(node.content[0].content)
  ) {
    return [node.toString()];
  }
  if (Array.isArray(node.content)) {
    return node.content.map(findColors).flat();
  }
  return [];
}

module.exports = { findColors };
