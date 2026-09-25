import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
export default defineConfig([
  ...nextVitals,
  globalIgnores([
    ".next/**",
    "node_modules/**",
    "_mobile/**",
    ".claude/**",
    "docs/**",
  ]),
  {
    rules: {
      "react/no-unescaped-entities": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/purity": "warn",
    },
  },
]);
