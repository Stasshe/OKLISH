import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import css from 'rollup-plugin-css-only';

const production = !process.env.ROLLUP_WATCH;

const config = {
  input: 'src/index.ts',
  onwarn(warning, warn) {
    if (warning.code === 'CIRCULAR_DEPENDENCY') {
      if (warning.ids?.some(id => id.includes('node_modules/svelte'))) return;
      if (warning.ids?.length === 2 && warning.ids[0] === warning.ids[1]) return;
    }
    if (warning.pluginCode === 'TS5096') return;
    warn(warning);
  },
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    {
      file: 'dist/oklish.js',
      format: 'umd',
      name: 'OKLISH',
      sourcemap: true,
      exports: 'named',
    },
  ],
  plugins: [
    svelte({
      compilerOptions: {
        dev: !production,
        runes: true,
      },
    }),
    css({ output: 'oklish.css' }),
    resolve({
      browser: true,
      dedupe: ['svelte'],
      exportConditions: ['svelte'],
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      sourceMap: true,
    }),
    production && terser(),
  ],
  external: [],
};

export default config;
