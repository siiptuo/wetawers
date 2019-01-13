function findColors(node) {
  if (node.type == "color") {
    return [node.content];
  }
  if (Array.isArray(node.content)) {
    return node.content.map(findColors).flat();
  }
  return [];
}

module.exports = { findColors };
