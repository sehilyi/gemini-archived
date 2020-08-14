import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';

export default {
  input: 'build/src/index.js',
  output: {
    file: 'build/gemini-editor.js',
    sourcemap: true,
    format: 'umd',
    name: 'GeminiEditor'
  },
  plugins: [nodeResolve({browser: true}), commonjs(), json(), sourcemaps()]
};