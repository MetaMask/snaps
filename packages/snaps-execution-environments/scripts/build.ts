/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
import browserify from 'browserify';
import { promises as fs } from 'fs';
// @ts-expect-error No types for now
import LavaMoatBrowserify from 'lavamoat-browserify';
import path from 'path';

const ENTRY_POINTS = { iframe: './src/iframe/index.ts' };
const OUTPUT_PATH = './dist/browserify';
const OUTPUT_HTML = 'index.html';

async function main() {
  return Promise.all(
    Object.entries(ENTRY_POINTS).map(async ([key, entryPoint]) => {
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

      bundler.plugin(LavaMoatBrowserify, { writeAutoPolicy: true });

      const buffer = await new Promise((resolve, reject) => {
        bundler.bundle((error, bundle) => {
          if (error) {
            reject(error);
          } else {
            resolve(bundle);
          }
        });
      });

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

      return buffer;
    }),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
