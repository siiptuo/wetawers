function findColors(node) {
  if (node.type == "color") {
    return { content: node.content, start: node.start, end: node.end };
  }
  if (
    node.type == "function" &&
    ["rgb", "rgba", "hsl", "hsla"].includes(node.content[0].content)
  ) {
    return [{ content: node.toString(), start: node.start, end: node.end }];
  }
  if (Array.isArray(node.content)) {
    return node.content.map(findColors).flat();
  }
  return [];
}

module.exports = { findColors };
