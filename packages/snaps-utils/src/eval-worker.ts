// eslint-disable-next-line import-x/no-unassigned-import
import 'ses/lockdown';

import { assert } from '@metamask/utils';
import { readFileSync } from 'fs';

import type { HandlerType } from './handlers';
import { SNAP_EXPORT_NAMES } from './handlers';
import { generateMockEndowments } from './mock';

// eslint-disable-next-line @typescript-eslint/unbound-method
assert(process.send, 'This script must be run as a child process.');

declare let lockdown: any, Compartment: any;

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

// Send the exports back to the parent process for analysis.
process.send({
  type: 'snap-exports',
  data: {
    exports: Object.keys(snapModule.exports),
  },
});

const invalidExports = Object.keys(snapModule.exports).filter(
  (snapExport) => !SNAP_EXPORT_NAMES.includes(snapExport as HandlerType),
);

if (invalidExports.length > 0) {
  // eslint-disable-next-line no-console
  console.warn(`Invalid snap exports detected:\n${invalidExports.join('\n')}`);
}

// To ensure the worker exits we explicitly call exit here
// If we didn't the eval would wait for timers set during Compartment eval
process.exit(0);
