/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
import { createResolvePath } from 'babel-plugin-tsconfig-paths-module-resolver';
import browserify from 'browserify';
import { promises as fs } from 'fs';
// @ts-expect-error No types for now
import LavaMoatBrowserify from 'lavamoat-browserify';
import path from 'path';
import yargs from 'yargs';

const defaultResolvePath = createResolvePath();

const ENTRY_POINTS = {
  iframe: { entryPoint: './src/iframe/index.ts', html: true, node: false },
  offscreen: {
    entryPoint: './src/offscreen/index.ts',
    html: true,
    node: false,
  },
  'node-thread': {
    entryPoint: './src/node-thread/index.ts',
    html: false,
    node: true,
  },
  'node-process': {
    entryPoint: './src/node-process/index.ts',
    html: false,
    node: true,
  },
};
const OUTPUT_PATH = './dist/browserify';
const OUTPUT_HTML = 'index.html';
const OUTPUT_BUNDLE = 'bundle.js';

/**
 * Builds snaps execution environments using Browserify and LavaMoat.
 *
 */
async function main() {
  const {
    argv: { writeAutoPolicy },
  } = yargs(process.argv.slice(2)).usage(
    '$0 [options]',
    'Build snaps execution environments',
    (yargsInstance) =>
      yargsInstance
        .option('writeAutoPolicy', {
          alias: ['p'],
          default: false,
          demandOption: false,
          description: 'Whether to regenerate the LavaMoat policy or not',
          type: 'boolean',
        })
        .strict(),
  );

  await Promise.all(
    Object.entries(ENTRY_POINTS).map(async ([key, config]) => {
      console.log('Bundling', key);
      const { html, entryPoint, node } = config;
      const insertGlobalVars = node
        ? { process: undefined, ...LavaMoatBrowserify.args.insertGlobalVars }
        : LavaMoatBrowserify.args.insertGlobalVars;
      const bundler = browserify(entryPoint, {
        ...LavaMoatBrowserify.args,
        insertGlobalVars,
        extensions: ['.ts'],
        node,
      });

      if (node) {
        bundler.external([
          'worker_threads',
          'buffer',
          'stream',
          'tty',
          'crypto',
          'util',
          'events',
          'os',
          'timers',
          'fs',
        ]);
      }

      bundler.transform(require('babelify'), {
        extensions: ['.js', '.ts'],
        presets: [
          require('@babel/preset-typescript'),
          [
            require('@babel/preset-env'),
            {
              targets: {
                browsers: ['chrome >= 80', 'firefox >= 78'],
              },
            },
          ],
        ],
        plugins: [
          [
            require('babel-plugin-tsconfig-paths-module-resolver'),
            {
              resolvePath: (
                sourcePath: string,
                currentFile: string,
                opts: any,
              ) => {
                const result = defaultResolvePath(
                  sourcePath,
                  currentFile,
                  opts,
                );
                // Result is null for modules found in node_modules
                if (!result) {
                  return null;
                }
                // Force resolve `@metamask/snaps-utils` to browser bundle regardless of environment to reduce bundle size
                // Use default resolver for everything else
                if (
                  sourcePath === '@metamask/snaps-utils' &&
                  result.includes('../snaps-utils/src')
                ) {
                  return `${result}/index.browser`;
                }
                return result;
              },
            },
          ],
        ],
      });

      // Tree shaking
      bundler.transform('@browserify/uglifyify', { global: true });
      bundler.plugin('common-shakeify', { ecmaVersion: 2020 });

      bundler.plugin(LavaMoatBrowserify, {
        writeAutoPolicy,
        policy: path.resolve(
          __dirname,
          `../lavamoat/browserify/${key}/policy.json`,
        ),
        policyName: key,
        policyOverride: path.resolve(
          __dirname,
          `../lavamoat/browserify/policy-override.json`,
        ),
        // Only enable for browser builds for now due to incompatiblities
        scuttleGlobalThis: !node,
        scuttleGlobalThisExceptions: ['postMessage'],
      });

      const buffer = await new Promise((resolve, reject) => {
        bundler.bundle((error, bundle) => {
          if (error) {
            reject(error);
          } else {
            resolve(bundle);
          }
        });
      });

      if (html) {
        const htmlFile = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>MetaMask Snaps Iframe Execution Environment</title>
          <script>${(buffer as Uint8Array).toString()}</script>
        </head>
      </html>`;

        const htmlPath = path.join(OUTPUT_PATH, key, OUTPUT_HTML);
        await fs.mkdir(path.dirname(htmlPath), { recursive: true });
        await fs.writeFile(htmlPath, htmlFile);
      } else {
        const bundlePath = path.join(OUTPUT_PATH, key, OUTPUT_BUNDLE);
        await fs.mkdir(path.dirname(bundlePath), { recursive: true });
        await fs.writeFile(bundlePath, buffer as Uint8Array);
      }

      console.log('Finished', key);
      return buffer;
    }),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
