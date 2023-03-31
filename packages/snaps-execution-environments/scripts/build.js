/* eslint-disable no-console, node/global-require, node/no-process-exit */
const {
  createResolvePath,
} = require('babel-plugin-tsconfig-paths-module-resolver');
const browserify = require('browserify');
const { promises: fs } = require('fs');
const LavaMoatBrowserify = require('lavamoat-browserify');
const path = require('path');
const yargs = require('yargs');

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
  'worker-pool': {
    entryPoint: './src/webworker/WebWorkerPool.ts',
    html: true,
    node: false,
  },
  worker: {
    entryPoint: './src/webworker/index.ts',
    html: false,
    node: false,
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
      yargsInstance.option('writeAutoPolicy', {
        alias: ['p'],
        default: false,
        demandOption: false,
        description: 'Whether to regenerate the LavaMoat policy or not',
        type: 'boolean',
      }),
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
              resolvePath: (sourcePath, currentFile, opts) => {
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
      bundler.transform(require('@browserify/uglifyify'), { global: true });
      bundler.plugin(require('common-shakeify'), { ecmaVersion: 2020 });

      // Add LavaMoat to wrap bundles in LavaPack
      // For Node.js builds, this also includes a prelude that contains SES and the LavaMoat runtime
      // For browser builds, the prelude is skipped and inlined in a script tag before the main bundle instead
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
        // Prelude is included in Node, in the browser it is inlined.
        includePrelude: node,
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

      const bundlePath = path.join(OUTPUT_PATH, key, OUTPUT_BUNDLE);
      await fs.mkdir(path.dirname(bundlePath), { recursive: true });
      await fs.writeFile(bundlePath, buffer);

      if (html) {
        const lavaMoatRuntimeString = await fs.readFile(
          require.resolve('@lavamoat/lavapack/src/runtime.js'),
          'utf-8',
        );
        const lavaMoatRuntime = lavaMoatRuntimeString.replace(
          '__lavamoatSecurityOptions__',
          JSON.stringify({
            // Only enable for browser builds for now due to incompatiblities
            scuttleGlobalThis: true,
            scuttleGlobalThisExceptions: ['postMessage', 'removeEventListener'],
          }),
        );

        const htmlFile = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>MetaMask Snaps Iframe Execution Environment</title>
          <script>${lavaMoatRuntime}</script>
          <script src="bundle.js"></script>
        </head>
      </html>`;

        const htmlPath = path.join(OUTPUT_PATH, key, OUTPUT_HTML);
        await fs.mkdir(path.dirname(htmlPath), { recursive: true });
        await fs.writeFile(htmlPath, htmlFile);
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
