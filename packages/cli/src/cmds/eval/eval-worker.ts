import { parentPort } from 'worker_threads';
import { readFileSync } from 'fs';
import { generateMockEndowments } from './mock';

// eslint-disable-next-line import/no-unassigned-import
import 'ses/lockdown';

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

    new Compartment(getMockEndowments()).evaluate(
      readFileSync(snapFilePath, 'utf8'),
    );
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
