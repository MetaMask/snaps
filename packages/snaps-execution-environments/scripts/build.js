/* eslint-disable no-console, node/no-process-exit */
const { join } = require('path');
const { Worker } = require('worker_threads');
const yargs = require('yargs');

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
    Object.entries(ENTRY_POINTS).map(([key, config]) => {
      console.log(`Building ${key}.`);

      const worker = new Worker(join(__dirname, './builder.js'), {
        stdout: true,
        stderr: true,
        workerData: { key, config, writeAutoPolicy },
      });

      worker.stderr.on('data', (data) => {
        console.log(data.toString());
      });

      return new Promise((resolve, reject) => {
        worker.on('exit', (code) => {
          if (code !== 0) {
            reject(new Error(`Worker stopped with exit code ${code}`));
          }

          console.log(`Finished building ${key}.`);
          resolve();
        });
      });
    }),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
