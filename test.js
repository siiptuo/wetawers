const assert = require("assert");
const gonzales = require("gonzales-pe");

const { findColors } = require("./");

describe("findColors", () => {
  it("should find #rrggbb colors", () => {
    const parseTree = gonzales.parse("body { color: #ff0099 }");
    assert.deepEqual(findColors(parseTree), ["ff0099"]);
  });

  it("should find #rrggbbaa colors", () => {
    const parseTree = gonzales.parse("body { color: #ff0099ff }");
    assert.deepEqual(findColors(parseTree), ["ff0099ff"]);
  });

  it("should find rgb() colors", () => {
    const parseTree = gonzales.parse("body { color: rgb(255, 0, 153) }");
    assert.deepEqual(findColors(parseTree), ["rgb(255, 0, 153)"]);
  });

  it("should find rgba() colors", () => {
    const parseTree = gonzales.parse("body { color: rgba(51, 170, 51, .1) }");
    assert.deepEqual(findColors(parseTree), ["rgba(51, 170, 51, .1)"]);
  });

  it("should find hsl() colors", () => {
    const parseTree = gonzales.parse("body { color: hsl(270, 60%, 70%) }");
    assert.deepEqual(findColors(parseTree), ["hsl(270, 60%, 70%)"]);
  });

  it("should find hsla() colors", () => {
    const parseTree = gonzales.parse(
      "body { color: hsla(240, 100%, 50%, .05) }"
    );
    assert.deepEqual(findColors(parseTree), ["hsla(240, 100%, 50%, .05)"]);
  });
});
