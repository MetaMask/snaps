/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
import browserify from 'browserify';
import { promises as fs } from 'fs';
// @ts-expect-error No types for now
import LavaMoatBrowserify from 'lavamoat-browserify';
import path from 'path';
import yargs from 'yargs';

const ENTRY_POINTS = {
  iframe: { entryPoint: './src/iframe/index.ts', html: true },
  offscreen: { entryPoint: './src/offscreen/index.ts', html: true },
  'node-thread': { entryPoint: './src/node-thread/index.ts', html: false },
  'node-process': { entryPoint: './src/node-process/index.ts', html: false },
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
      const { html, entryPoint } = config;
      const bundler = browserify(entryPoint, {
        extensions: ['.ts'],
        ...LavaMoatBrowserify.args,
      });

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
      });

      bundler.plugin(LavaMoatBrowserify, { writeAutoPolicy });

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

      return buffer;
    }),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
