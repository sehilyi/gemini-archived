import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import scss from 'rollup-plugin-scss';
import nodeResolve from '@rollup/plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.tsx',
  output: {
    // file: 'build/gemini-editor.js',
    dir: 'build',
    sourcemap: true,
    format: 'umd',
    name: 'GeminiEditor'
  },
  plugins: [
      typescript({tsconfig: "src/tsconfig.json"}), 
      scss({output: "build/index.css"}), 
      nodeResolve({browser: true}), 
      commonjs(), 
      json(), 
      sourcemaps()
    ]
};