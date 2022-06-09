import { babel } from '@rollup/plugin-babel';
import { resolve } from 'node:path';
import { defineConfig, ModuleFormat } from 'rollup';
import { terser } from 'rollup-plugin-terser';
import ts from 'rollup-plugin-ts';
import pkg from './package.json';

const ROOT_DIR = process.cwd();
const isDev = process.env['ROLLUP_WATCH'] === 'true';

const filename = ({ mode, format }: { mode: string; format: ModuleFormat }) => {
  let extension: string;
  switch (format) {
    case 'cjs':
    case 'commonjs':
      extension = 'cjs';
      break;

    case 'es':
    case 'esm':
    case 'module':
      extension = 'mjs';
      break;

    default:
      extension = 'js';
      break;
  }
  return resolve(ROOT_DIR, 'dist', `${mode}.${extension}`);
};

const banner = ({ mode, format }: { mode: string; format: ModuleFormat }) =>
  `/* ${pkg.name}@${pkg.version} (${mode} - ${format}) */`;

const serverConfig = defineConfig({
  input: resolve(ROOT_DIR, 'src/server/index.ts'),
  output: [
    {
      banner: banner({ mode: 'server', format: 'cjs' }),
      file: filename({ mode: 'server', format: 'cjs' }),
      format: 'cjs',
      sourcemap: isDev,
    },
    {
      banner: banner({ mode: 'server', format: 'esm' }),
      file: filename({ mode: 'server', format: 'esm' }),
      format: 'esm',
      sourcemap: isDev,
    },
  ],
  external: ['cookie'],
  plugins: [
    ts(),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: [['@babel/env', { targets: { node: 'current' } }]],
    }),
    !isDev && terser({ compress: { passes: 2 } }),
  ],
});

const configs = [serverConfig];

export default configs;
