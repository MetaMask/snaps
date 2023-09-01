/* eslint-disable no-console, n/global-require */
const {
  createResolvePath,
} = require('babel-plugin-tsconfig-paths-module-resolver');
const browserify = require('browserify');
const { promises: fs } = require('fs');
const LavaMoatBrowserify = require('lavamoat-browserify');
const { builtinModules } = require('node:module');
const path = require('path');
const { minify } = require('terser');
const yargs = require('yargs');

const defaultResolvePath = createResolvePath();

const ENTRY_POINTS = {
  iframe: { entryPoint: './src/iframe/index.ts', html: true, node: false },
  offscreen: {
    entryPoint: './src/offscreen/index.ts',
    html: true,
  },
  'node-thread': {
    entryPoint: './src/node-thread/index.ts',
    node: true,
  },
  'node-process': {
    entryPoint: './src/node-process/index.ts',
    node: true,
  },
  'worker-executor': {
    entryPoint: './src/webworker/executor/index.ts',
    worker: true,
  },
  'worker-pool': {
    entryPoint: './src/webworker/pool/index.ts',
    html: true,
  },
};

const OUTPUT_PATH = './dist/browserify';
const OUTPUT_HTML = 'index.html';
const OUTPUT_BUNDLE = 'bundle.js';

/**
 * Create a worker for each entry point and wait for them to finish.
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

  const lavamoatSecurityOptionsNode = {};

  const lavamoatSecurityOptionsBrowser = {
    // Only enable for browser builds for now due to incompatibilities.
    scuttleGlobalThis: {
      enabled: true,
      exceptions: ['postMessage', 'removeEventListener', 'isSecureContext'],
    },
  };

  const lavaMoatRuntimeString = await fs.readFile(
    require.resolve('@lavamoat/lavapack/src/runtime.js'),
    'utf-8',
  );

  // These can be re-used for all bundles

  const lavaMoatRuntimeNode = lavaMoatRuntimeString.replace(
    '__lavamoatSecurityOptions__',
    JSON.stringify(lavamoatSecurityOptionsNode),
  );

  const lavaMoatRuntimeBrowser = lavaMoatRuntimeString.replace(
    '__lavamoatSecurityOptions__',
    JSON.stringify(lavamoatSecurityOptionsBrowser),
  );

  const htmlFile = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>MetaMask Snaps Iframe Execution Environment</title>
    <script>${lavaMoatRuntimeBrowser}</script>
    <script src="bundle.js"></script>
  </head>
</html>`;

  await Promise.all(
    Object.entries(ENTRY_POINTS).map(async ([key, config]) => {
      console.log('Bundling', key);
      const { html, node, worker, entryPoint } = config;
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
        bundler.external(builtinModules);
      } else {
        // The crypto polyfills are erroneously included in the browser bundle, this prevents that.
        bundler.exclude(['crypto']);
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
                // Force resolve `@metamask/snaps-utils` to execution env bundle regardless of environment to reduce bundle size
                // Use default resolver for everything else
                if (
                  sourcePath === '@metamask/snaps-utils' &&
                  result.includes('../snaps-utils/src')
                ) {
                  return `${result}/index.executionenv`;
                }
                return result;
              },
            },
          ],
        ],
      });

      const lavamoatSecurityOptions =
        worker || html
          ? lavamoatSecurityOptionsBrowser
          : lavamoatSecurityOptionsNode;

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
        // Prelude is not included, we will inline that ourselves to allow for minification.
        includePrelude: false,
        ...lavamoatSecurityOptions,
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

      // Minification
      const minifiedBundle = (
        await minify(buffer.toString(), { sourceMap: false })
      ).code;

      let outputBundle = minifiedBundle;

      // For non HTML bundles, we inline the runtime in the bundle.
      if (!html) {
        const runtime = node ? lavaMoatRuntimeNode : lavaMoatRuntimeBrowser;
        outputBundle = `${runtime}\n${outputBundle}`;
      }

      const bundlePath = path.join(OUTPUT_PATH, key, OUTPUT_BUNDLE);
      await fs.mkdir(path.dirname(bundlePath), { recursive: true });
      await fs.writeFile(bundlePath, outputBundle);

      if (html) {
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
  process.exitCode = 1;
});
