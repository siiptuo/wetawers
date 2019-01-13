const assert = require("assert");
const gonzales = require("gonzales-pe");

const { findColors } = require("./");

describe("findColors", () => {
  it("should find color", () => {
    const parseTree = gonzales.parse("body { color: #aabbcc }");
    assert.deepEqual(findColors(parseTree), ["aabbcc"]);
  });
});
