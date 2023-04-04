/* eslint-disable no-console, node/global-require, node/no-process-exit, node/no-process-env */
const {
  createResolvePath,
} = require('babel-plugin-tsconfig-paths-module-resolver');
const browserify = require('browserify');
const { promises: fs } = require('fs');
const LavaMoatBrowserify = require('lavamoat-browserify');
const path = require('path');

const {
  ENTRY_POINTS,
  OUTPUT_BUNDLE,
  OUTPUT_HTML,
  OUTPUT_PATH,
} = require('./constants');

const defaultResolvePath = createResolvePath();

/**
 * Builds a specific snaps execution environment using Browserify and LavaMoat.
 * As specified by BUILD_TYPE.
 */
async function main() {
  const writeAutoPolicy = process.env.WRITE_AUTO_POLICY;
  const type = process.env.BUILD_TYPE;

  const config = ENTRY_POINTS[type];
  console.log('Bundling', type);
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
            const result = defaultResolvePath(sourcePath, currentFile, opts);
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
      `../lavamoat/browserify/${type}/policy.json`,
    ),
    policyName: type,
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

  const bundlePath = path.join(OUTPUT_PATH, type, OUTPUT_BUNDLE);
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

    const htmlPath = path.join(OUTPUT_PATH, type, OUTPUT_HTML);
    await fs.mkdir(path.dirname(htmlPath), { recursive: true });
    await fs.writeFile(htmlPath, htmlFile);
  }

  console.log('Finished', type);
  return buffer;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
