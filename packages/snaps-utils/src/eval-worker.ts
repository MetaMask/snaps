// eslint-disable-next-line import-x/no-unassigned-import
import 'ses/lockdown';

import { assert } from '@metamask/utils';
import { readFileSync } from 'fs';

import type { HandlerType } from './handlers';
import { SNAP_EXPORT_NAMES } from './handlers';
import { generateMockEndowments } from './mock';

lockdown({
  errorTaming: 'unsafe',
  stackFiltering: 'verbose',
  overrideTaming: 'severe',
  localeTaming: 'unsafe',

  // We disable domain taming, because it does not work in certain cases when
  // running tests. This is unlikely to be a problem in production, because
  // Node.js domains are deprecated.
  domainTaming: 'unsafe',
});

const snapFilePath = process.argv[2];

const snapModule: { exports?: any } = { exports: {} };

const compartment = new Compartment({
  ...generateMockEndowments(),
  module: snapModule,
  exports: snapModule.exports,
});

// Add self referential properties for compatibility with 3rd party libraries.
// This mirrors the implementation in the Snaps execution environment.
compartment.globalThis.self = compartment.globalThis;
compartment.globalThis.global = compartment.globalThis;
compartment.globalThis.window = compartment.globalThis;

compartment.evaluate(readFileSync(snapFilePath, 'utf8'));

/**
 * Check the exports of the Snap module to ensure they are valid, and exit the
 * worker process.
 *
 * @param exports - The exports of the Snap module.
 */
function checkExports(exports: any) {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  assert(process.send, 'This script must be run as a child process.');

  process.send({
    type: 'snap-exports',
    data: {
      exports: Object.keys(exports),
    },
  });

  const invalidExports = Object.keys(snapModule.exports).filter(
    (snapExport) => !SNAP_EXPORT_NAMES.includes(snapExport as HandlerType),
  );

  if (invalidExports.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(
      `Invalid snap exports detected:\n${invalidExports.join('\n')}`,
    );
  }

  // To ensure the worker exits we explicitly call exit here. If we didn't, the
  // worker would wait for timers set during `Compartment` eval.
  process.exit(0);
}

if (snapModule.exports instanceof Promise) {
  // The Snap may use async logic (e.g., when loading WASM), so we need to
  // handle that case.
  snapModule.exports.then(checkExports).catch((error: Error) => {
    // eslint-disable-next-line no-console
    console.error('Error loading Snap module:', error);
  });
} else {
  checkExports(snapModule.exports);
}
