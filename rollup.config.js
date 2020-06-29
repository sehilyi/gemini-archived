import json from "@rollup/plugin-json";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";

export default {
  input: "src/index.tsx",
  output: {
    file: "dist/gemini.js",
    format: "umd",
    sourcemap: true,
    name: "gemini",
  },
  plugins: [resolve({ browser: true }), json(), commonjs()],
};
