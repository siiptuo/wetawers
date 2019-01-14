const assert = require("assert");
const gonzales = require("gonzales-pe");

const { findColors } = require("./");

describe("findColors", () => {
  it("should find #rrggbb colors", () => {
    const parseTree = gonzales.parse("body { color: #ff0099 }");
    assert.deepEqual(findColors(parseTree), [
      {
        rgba: [255, 0, 153, 1],
        content: "#ff0099",
        end: {
          column: 21,
          line: 1
        },
        start: {
          column: 15,
          line: 1
        }
      }
    ]);
  });

  // it("should find #rrggbbaa colors", () => {
  //   const parseTree = gonzales.parse("body { color: #ff0099ff }");
  //   assert.deepEqual(findColors(parseTree), [
  //     {
  //       rgba: [255, 0, 153, 1],
  //       content: "#ff0099ff",
  //       end: {
  //         column: 23,
  //         line: 1
  //       },
  //       start: {
  //         column: 15,
  //         line: 1
  //       }
  //     }
  //   ]);
  // });

  it("should find rgb() colors", () => {
    const parseTree = gonzales.parse("body { color: rgb(255, 0, 153) }");
    assert.deepEqual(findColors(parseTree), [
      {
        rgba: [255, 0, 153, 1],
        content: "rgb(255, 0, 153)",
        end: {
          column: 30,
          line: 1
        },
        start: {
          column: 15,
          line: 1
        }
      }
    ]);
  });

  it("should find rgba() colors", () => {
    const parseTree = gonzales.parse("body { color: rgba(51, 170, 51, .1) }");
    assert.deepEqual(findColors(parseTree), [
      {
        rgba: [51, 170, 51, 0.1],
        content: "rgba(51, 170, 51, .1)",
        end: {
          column: 35,
          line: 1
        },
        start: {
          column: 15,
          line: 1
        }
      }
    ]);
  });

  it("should find hsl() colors", () => {
    const parseTree = gonzales.parse("body { color: hsl(270, 60%, 70%) }");
    assert.deepEqual(findColors(parseTree), [
      {
        rgba: [178, 133, 224, 1],
        content: "hsl(270, 60%, 70%)",
        end: {
          column: 32,
          line: 1
        },
        start: {
          column: 15,
          line: 1
        }
      }
    ]);
  });

  it("should find hsla() colors", () => {
    const parseTree = gonzales.parse(
      "body { color: hsla(240, 100%, 50%, .05) }"
    );
    assert.deepEqual(findColors(parseTree), [
      {
        rgba: [0, 0, 255, 0.05],
        content: "hsla(240, 100%, 50%, .05)",
        end: {
          column: 39,
          line: 1
        },
        start: {
          column: 15,
          line: 1
        }
      }
    ]);
  });
});
