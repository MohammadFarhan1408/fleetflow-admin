import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // rules.md §6: components and functions are const arrow functions.
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "func-style": ["error", "expression"],
      "no-var": "error",
      "prefer-const": "error",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated from the fleetflow-api schema (npm run api:types)
    "src/generated/**",
  ]),
]);

export default eslintConfig;
