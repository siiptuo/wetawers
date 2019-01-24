const path = require("path");
const parseColor = require("parse-color");
const gonzales = require("gonzales-pe");

const colorFunction = /^(rgb|hsl)a?$/;

function handleImport(node) {
  if (node.content[2].type === "string") {
    return node.content[2].content.slice(1, -1);
  }
  if (node.content[2].type === "uri" && node.content[2].content.length > 0) {
    if (node.content[2].content[0].type === "string") {
      return node.content[2].content[0].content.slice(1, -1);
    }
    if (node.content[2].content[0].type === "raw") {
      return node.content[2].content[0].content;
    }
  }
  throw new Error("Unsupported @import");
}

function resolveImport(directory, file, resolver) {
  if (file[0] === "~") {
    file = file.slice(1);
    while (true) {
      const test = resolveImport(
        path.join(directory, "node_modules"),
        file,
        resolver
      );
      if (test) return test;
      if (directory === "/") break;
      directory = path.join(directory, "..");
    }
    return null;
  }
  file = path.join(directory, file);
  if (resolver.exists(file)) {
    return file;
  }
  const parts = path.parse(file);
  if (!parts.ext) {
    const scss = path.format({
      dir: parts.dir,
      name: parts.name,
      ext: ".scss"
    });
    if (resolver.exists(scss)) {
      return scss;
    }

    const partial = path.format({
      dir: parts.dir,
      name: "_" + parts.name,
      ext: ".scss"
    });
    if (resolver.exists(partial)) {
      return partial;
    }

    const css = path.format({
      dir: parts.dir,
      name: parts.name,
      ext: ".css"
    });
    if (resolver.exists(css)) {
      return css;
    }
  }
}

function parseFile(filename, resolver) {
  try {
    const parseTree = gonzales.parse(resolver.read(filename), {
      syntax: "scss"
    });
    let result = [
      {
        filename,
        parseTree,
        errors: []
      }
    ];
    const directory = path.dirname(filename);
    parseTree.traverseByType("atrule", node => {
      if (node.content[0].content[0].content !== "import") return;
      const importName = handleImport(node);
      const file = resolveImport(directory, importName, resolver);
      if (file) {
        result = [...parseFile(file, resolver), ...result];
      } else {
        result[result.length - 1].errors.push({
          start: node.start,
          end: node.end,
          message: `Couldn't resolve import: ${importName}`
        });
      }
    });
    return result;
  } catch (e) {
    // Check if ParsingError from Gonzales PE
    if (e.css_) {
      return [
        {
          filename,
          parseTree: null,
          errors: [
            {
              start: { line: e.line, column: 1 },
              end: { line: e.line, column: 1 },
              message: "Syntax error"
            }
          ]
        }
      ];
    } else {
      throw e;
    }
  }
}

function findColors(parseTree) {
  const colors = [];
  parseTree
    .filter(item => item.parseTree)
    .forEach(item => {
      item.parseTree.traverse(node => {
        if (node.type == "color") {
          const content = "#" + node.content;
          colors.push({
            rgba: parseColor(content).rgba,
            content,
            filename: item.filename,
            start: node.start,
            end: node.end
          });
        } else if (
          node.type == "function" &&
          node.content[0].content.match(colorFunction)
        ) {
          const content = node.toString();
          colors.push({
            rgba: parseColor(content).rgba,
            content,
            filename: item.filename,
            start: node.start,
            end: node.end
          });
        }
      });
    });
  return colors;
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

module.exports = { parseFile, findColors, compareColors, findDuplicates };
