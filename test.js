const assert = require("assert");
const gonzales = require("gonzales-pe");
const parseColor = require("parse-color");
const { spawnSync } = require("child_process");

const { parseFile, findColors, compareColors, findDuplicates } = require("./");

describe("parseFile", () => {
  const files = {
    "single.css": "body { color: #f09; }",
    "variables.css": "$color: #f09;",
    "import.css": '@import "variables.css"; body { color: $color; }',
    "_partial.scss": "$color: #f09;",
    "import_partial.scss": '@import "partial"; body { color: $color; }',
    "relative_import.scss": '@import "./partial"; body { color: $color; }',
    "missing_import.scss": '@import "missing"; body { color: $color; }',
    "syntax_error.scss": "asjdacn3"
  };
  const resolver = {
    exists(file) {
      return file in files;
    },
    read(file) {
      if (file in files) {
        return files[file];
      } else {
        throw new Error(`invalid file: ${file}`);
      }
    }
  };

  it("should parse without @import", () => {
    const parseTree = parseFile("single.css", resolver);
    assert.deepEqual(parseTree, [
      {
        filename: "single.css",
        parseTree: gonzales.parse(files["single.css"], { syntax: "scss" }),
        errors: []
      }
    ]);
  });

  it("should parse file with @import", () => {
    const parseTree = parseFile("import.css", resolver);
    assert.deepEqual(parseTree, [
      {
        filename: "variables.css",
        parseTree: gonzales.parse(files["variables.css"], { syntax: "scss" }),
        errors: []
      },
      {
        filename: "import.css",
        parseTree: gonzales.parse(files["import.css"], { syntax: "scss" }),
        errors: []
      }
    ]);
  });

  it("should import SCSS without exension");

  it("should import CSS without exension");

  it("should import partials", () => {
    const parseTree = parseFile("import_partial.scss", resolver);
    assert.deepEqual(parseTree, [
      {
        filename: "_partial.scss",
        parseTree: gonzales.parse(files["_partial.scss"], { syntax: "scss" }),
        errors: []
      },
      {
        filename: "import_partial.scss",
        parseTree: gonzales.parse(files["import_partial.scss"], {
          syntax: "scss"
        }),
        errors: []
      }
    ]);
  });

  it("should handle normal file and partial with same name");

  it("should import multiple files");

  it("should import using single quotes");

  it("should handle relative imports", () => {
    const parseTree = parseFile("relative_import.scss", resolver);
    assert.deepEqual(parseTree, [
      {
        filename: "_partial.scss",
        parseTree: gonzales.parse(files["_partial.scss"], { syntax: "scss" }),
        errors: []
      },
      {
        filename: "relative_import.scss",
        parseTree: gonzales.parse(files["relative_import.scss"], {
          syntax: "scss"
        }),
        errors: []
      }
    ]);
  });

  it("should handle absolute imports");

  it("should handle spaces");

  it("should handle inline property");

  it("should handle missing files", () => {
    const parseTree = parseFile("missing_import.scss", resolver);
    assert.deepEqual(parseTree, [
      {
        filename: "missing_import.scss",
        parseTree: gonzales.parse(files["missing_import.scss"], {
          syntax: "scss"
        }),
        errors: [
          {
            start: { line: 1, column: 1 },
            end: { line: 1, column: 17 },
            message: "Couldn't resolve import: missing"
          }
        ]
      }
    ]);
  });

  it("should handle syntax errors", () => {
    const parseTree = parseFile("syntax_error.scss", resolver);
    assert.deepEqual(parseTree, [
      {
        filename: "syntax_error.scss",
        parseTree: null,
        errors: [
          {
            start: { line: 1, column: 1 },
            end: { line: 1, column: 1 },
            message: "Syntax error"
          }
        ]
      }
    ]);
  });

  it("should handle cyclic imports");
});

describe("findColors", () => {
  it("should find #rrggbb colors", () => {
    const parseTree = [
      {
        filename: "style.css",
        parseTree: gonzales.parse("body { color: #ff0099 }")
      }
    ];
    assert.deepEqual(findColors(parseTree), [
      {
        rgba: [255, 0, 153, 1],
        content: "#ff0099",
        filename: "style.css",
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
    const parseTree = [
      {
        filename: "style.css",
        parseTree: gonzales.parse("body { color: rgb(255, 0, 153) }")
      }
    ];
    assert.deepEqual(findColors(parseTree), [
      {
        rgba: [255, 0, 153, 1],
        content: "rgb(255, 0, 153)",
        filename: "style.css",
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
    const parseTree = [
      {
        filename: "style.css",
        parseTree: gonzales.parse("body { color: rgba(51, 170, 51, .1) }")
      }
    ];
    assert.deepEqual(findColors(parseTree), [
      {
        rgba: [51, 170, 51, 0.1],
        content: "rgba(51, 170, 51, .1)",
        filename: "style.css",
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
    const parseTree = [
      {
        filename: "style.css",
        parseTree: gonzales.parse("body { color: hsl(270, 60%, 70%) }")
      }
    ];
    assert.deepEqual(findColors(parseTree), [
      {
        rgba: [178, 133, 224, 1],
        content: "hsl(270, 60%, 70%)",
        filename: "style.css",
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
    const parseTree = [
      {
        filename: "style.css",
        parseTree: gonzales.parse("body { color: hsla(240, 100%, 50%, .05) }")
      }
    ];
    assert.deepEqual(findColors(parseTree), [
      {
        rgba: [0, 0, 255, 0.05],
        content: "hsla(240, 100%, 50%, .05)",
        filename: "style.css",
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

  it("should find colors from multiple files", () => {
    const parseTree = [
      {
        filename: "style1.css",
        parseTree: gonzales.parse("body { color: #f00 }")
      },
      {
        filename: "style2.css",
        parseTree: gonzales.parse("body { color: #0f0 }")
      }
    ];
    assert.deepEqual(findColors(parseTree), [
      {
        rgba: [255, 0, 0, 1],
        content: "#f00",
        filename: "style1.css",
        start: {
          column: 15,
          line: 1
        },
        end: {
          column: 18,
          line: 1
        }
      },
      {
        rgba: [0, 255, 0, 1],
        content: "#0f0",
        filename: "style2.css",
        start: {
          column: 15,
          line: 1
        },
        end: {
          column: 18,
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
    assert.deepEqual(result.stderr, []);
    assert.deepEqual(result.stdout, [
      "color #ff0000 duplicated:",
      "- fixtures/duplicates.css:2:21",
      "- fixtures/duplicates.css:11:21",
      "",
      "color #00ff00 duplicated:",
      "- fixtures/duplicates.css:6:10",
      "- fixtures/duplicates.css:10:10",
      "",
      "Processed 1 file",
      "Found 2 duplicated colors",
      "",
      ""
    ]);
    assert.equal(result.status, 1);
  });

  it("should not find duplicates", () => {
    const result = run("fixtures/no-duplicates.css");
    assert.deepEqual(result.stderr, []);
    assert.deepEqual(result.stdout, [
      "Processed 1 file",
      "Found 0 duplicated colors",
      "",
      ""
    ]);
    assert.equal(result.status, 0);
  });

  it("should handle duplicates in different files", () => {
    const result = run("fixtures/import.scss");
    assert.deepEqual(result.stderr, []);
    assert.deepEqual(result.stdout, [
      "color #ff0000 duplicated:",
      "- fixtures/variables.scss:1:9",
      "- fixtures/import.scss:8:10",
      "",
      "Processed 2 files",
      "Found 1 duplicated color",
      "",
      ""
    ]);
    assert.equal(result.status, 1);
  });

  it("should output missing files", () => {
    const result = run("fixtures/missing.scss");
    assert.deepEqual(result.stderr, []);
    assert.deepEqual(result.stdout, [
      "Errors:",
      "- fixtures/missing.scss:2:1: Couldn't resolve import: iammissing",
      "",
      "color #ff0000 duplicated:",
      "- fixtures/variables.scss:1:9",
      "- fixtures/missing.scss:9:10",
      "",
      "Processed 2 files",
      "Found 1 duplicated color",
      "",
      ""
    ]);
    assert.equal(result.status, 1);
  });

  it("should handle syntax error", () => {
    const result = run("fixtures/error.scss");
    assert.deepEqual(result.stderr, []);
    assert.deepEqual(result.stdout, [
      "Errors:",
      "- fixtures/error.scss:1:1: Syntax error",
      "",
      "Processed 1 file",
      "Found 0 duplicated colors",
      "",
      ""
    ]);
    assert.equal(result.status, 1);
  });
});
