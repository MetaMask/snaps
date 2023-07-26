// eslint-disable-next-line import/no-unassigned-import
import 'ses/lockdown';

import { readFileSync } from 'fs';

import type { HandlerType } from './handlers';
import { generateMockEndowments } from './mock';
import { SNAP_EXPORT_NAMES } from './types';

declare let lockdown: any, Compartment: any;

lockdown({
  consoleTaming: 'unsafe',
  errorTaming: 'unsafe',
  mathTaming: 'unsafe',
  dateTaming: 'unsafe',
  overrideTaming: 'severe',

  // We disable domain taming, because it does not work in certain cases when
  // running tests. This is unlikely to be a problem in production, because
  // Node.js domains are deprecated.
  domainTaming: 'unsafe',
});

/**
 * Get mock endowments that don't do anything. This is useful for running the
 * eval, for snaps that try to communicate with the extension on initialisation,
 * for example.
 *
 * @returns The mock endowments.
 */
function getMockEndowments() {
  const endowments = generateMockEndowments();
  return {
    ...endowments,
    window: endowments,
    self: endowments,
  };
}

const snapFilePath = process.argv[2];

const snapModule: { exports?: any } = { exports: {} };

new Compartment({
  ...getMockEndowments(),
  module: snapModule,
  exports: snapModule.exports,
}).evaluate(readFileSync(snapFilePath, 'utf8'));

const invalidExports = Object.keys(snapModule.exports).filter(
  (snapExport) => !SNAP_EXPORT_NAMES.includes(snapExport as HandlerType),
);

if (invalidExports.length > 0) {
  // eslint-disable-next-line no-console
  console.warn(`Invalid snap exports detected:\n${invalidExports.join('\n')}`);
}

setTimeout(() => process.exit(0), 1000); // Hack to ensure worker exits
