import { createCn } from "cn/config";

/**
 * Class merging that knows the design tokens. Without this, `cn("text-label text-text")` reads both as text
 * colours and drops the type style. Keep in sync with tokens.css (cn.test.ts checks it).
 */
export const TYPE_STYLES = [
  "display",
  "h2",
  "h3",
  "body",
  "body-strong",
  "table",
  "label",
  "caption",
  "overline",
  "kpi",
];

export const cn = createCn({
  extend: {
    theme: {
      text: TYPE_STYLES,
      shadow: ["1", "2"],
    },
  },
});
