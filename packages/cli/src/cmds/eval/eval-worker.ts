import { readFileSync } from 'fs';
// eslint-disable-next-line import/no-unassigned-import
import 'ses/lockdown';
import { parentPort } from 'worker_threads';
import { generateMockEndowments } from './mock';

declare let lockdown: any, Compartment: any;

lockdown({
  consoleTaming: 'unsafe',
  errorTaming: 'unsafe',
  mathTaming: 'unsafe',
  dateTaming: 'unsafe',
  overrideTaming: 'severe',
});

if (parentPort !== null) {
  parentPort.on('message', (message: { snapFilePath: string }) => {
    const { snapFilePath } = message;

    const snapModule: { exports?: any } = { exports: {} };

    new Compartment({
      ...getMockEndowments(),
      module: snapModule,
      exports: snapModule.exports,
    }).evaluate(readFileSync(snapFilePath, 'utf8'));

    if (!snapModule.exports?.onRpcRequest) {
      console.warn("The Snap doesn't have onRpcRequest export defined");
    }

    setTimeout(() => process.exit(0), 1000); // Hack to ensure worker exits
  });
}

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
