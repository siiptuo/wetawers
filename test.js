const assert = require("assert");
const gonzales = require("gonzales-pe");
const parseColor = require("parse-color");
const { spawnSync } = require("child_process");

const { findColors, compareColors, findDuplicates } = require("./");

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

describe("compareColors", () => {
  it("should return zero for same colors", () => {
    const a = [270, 60, 70, 1];
    assert.equal(compareColors(a, a), 0);
  });

  it("should return non-zero for different colors", () => {
    const a = [270, 60, 70, 1];
    const b = [240, 100, 50, 1];
    assert.notEqual(compareColors(a, b), 0);
  });
});

describe("findDuplicates", () => {
  function makeColor(content) {
    return {
      rgba: parseColor(content).rgba,
      content,
      start: {
        line: 1,
        column: 1
      },
      end: {
        line: 1,
        column: 1
      }
    };
  }

  it("should find exact duplicates", () => {
    const color1 = makeColor("#ff0000");
    const color2 = makeColor("#ff0000");
    const color3 = makeColor("#00ff00");
    assert.deepEqual(findDuplicates([color1, color2, color3]), [
      [color1, color2]
    ]);
  });

  it("should find similar colors", () => {
    const color1 = makeColor("#ff0000");
    const color2 = makeColor("#ff0001");
    const color3 = makeColor("#00ff00");
    assert.deepEqual(findDuplicates([color1, color2, color3]), [
      [color1, color2]
    ]);
  });
});

describe("CLI", () => {
  function run(...args) {
    const { status, stdout, stderr } = spawnSync("node", ["./cli.js", ...args]);
    return {
      status,
      stdout: stdout.length === 0 ? [] : stdout.toString().split("\n"),
      stderr: stderr.length === 0 ? [] : stderr.toString().split("\n")
    };
  }

  it("should find duplicates", () => {
    const result = run("fixtures/duplicates.css");
    assert.deepEqual(result.stdout, [
      "color #ff0000 duplicated:",
      "- fixtures/duplicates.css:2:21",
      "- fixtures/duplicates.css:11:21",
      "",
      "color #00ff00 duplicated:",
      "- fixtures/duplicates.css:6:10",
      "- fixtures/duplicates.css:10:10",
      "",
      ""
    ]);
    assert.deepEqual(result.stderr, []);
    assert.equal(result.status, 1);
  });

  it("should not find duplicates", () => {
    const result = run("fixtures/no-duplicates.css");
    assert.deepEqual(result.stdout, []);
    assert.deepEqual(result.stderr, []);
    assert.equal(result.status, 0);
  });
});
