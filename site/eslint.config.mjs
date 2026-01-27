import { FlatCompat } from "@eslint/eslintrc";
import { defineConfig } from "../../eslint.config.js";
import { globalIgnores } from "eslint/config";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default [
  globalIgnores(["next-env.d.ts"]),
  ...defineConfig({ tsconfigDirName: import.meta.dirname }),
  ...compat.extends("next/core-web-vitals"),
];

