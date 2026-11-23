// Enforces design.md §4 and §12.3 in source: tokens only, no raw colours,
// no arbitrary values for design-controlled utilities, spacing on the scale.
// Usage: node scripts/lint-tokens.mjs [dir...]   (default: src)
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// design.md §4 spacing scale (px) as Tailwind steps (step × 4 px).
const SPACING_STEPS = new Set(["0", "0.5", "1", "1.5", "2", "3", "4", "5", "6", "8", "10", "12", "16"]);
const SPACING = "(?:p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|ms|me|gap|gap-x|gap-y|space-x|space-y)";
const DESIGN_CONTROLLED = `(?:${SPACING}|text|bg|border|rounded|shadow|font|leading|tracking|ring|outline|fill|stroke)`;

const rules = [
  { name: "raw hex colour", pattern: /#[0-9a-fA-F]{3,8}\b/g },
  { name: "raw colour function", pattern: /\b(?:rgba?|hsla?|oklch|oklab)\(/g },
  {
    name: "arbitrary value on a design token utility",
    pattern: new RegExp(`(?<![\\w-])-?${DESIGN_CONTROLLED}-\\[`, "g"),
  },
];
const spacingPattern = new RegExp(`(?<![\\w-])-?${SPACING}-(\\d+(?:\\.\\d+)?)(?![\\w.])`, "g");
const IGNORED_DIRS = new Set(["generated", "node_modules"]);

function* sourceFiles(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      if (!IGNORED_DIRS.has(entry)) yield* sourceFiles(path);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      yield path;
    }
  }
}

const findViolations = (source) => {
  const found = [];
  source.split("\n").forEach((line, index) => {
    for (const { name, pattern } of rules) {
      for (const match of line.matchAll(pattern)) found.push({ line: index + 1, rule: name, text: match[0] });
    }
    for (const match of line.matchAll(spacingPattern)) {
      if (!SPACING_STEPS.has(match[1])) found.push({ line: index + 1, rule: "spacing off the scale", text: match[0] });
    }
  });
  return found;
};

const dirs = process.argv.slice(2);
let total = 0;
for (const dir of dirs.length ? dirs : ["src"]) {
  for (const file of sourceFiles(dir)) {
    for (const v of findViolations(readFileSync(file, "utf8"))) {
      console.error(`${file}:${v.line}  ${v.rule}: ${v.text}`);
      total++;
    }
  }
}
if (total) {
  console.error(`\n${total} design token violation(s). See design.md §4 and §12.`);
  process.exit(1);
}
console.log("Design tokens: no violations.");
