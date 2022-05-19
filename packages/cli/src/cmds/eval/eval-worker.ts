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

    const snapModule: any = { exports: {} };

    new Compartment({
      ...getMockEndowments(),
      module: snapModule,
      exports: snapModule.exports,
    }).evaluate(readFileSync(snapFilePath, 'utf8'));

    if (!snapModule.exports?.onMessage) {
      console.warn("The Snap doesn't have onMessage export defined");
    }

    setTimeout(() => process.exit(0), 1000); // Hack to ensure worker exits
  });
}

function getMockEndowments() {
  const endowments = generateMockEndowments();
  return {
    ...endowments,
    window: endowments,
    self: endowments,
  };
}
