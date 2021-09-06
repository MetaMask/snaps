import { parentPort } from 'worker_threads';
import { readFileSync } from 'fs';
import crypto from 'crypto';

// eslint-disable-next-line import/no-unassigned-import, @typescript-eslint/no-require-imports
require('ses/lockdown');

declare let lockdown: any, Compartment: any;

lockdown({
  mathTaming: 'unsafe',
  errorTaming: 'unsafe',
});

if (parentPort !== null) {
  parentPort.on('message', (message: { pluginFilePath: string }) => {
    const { pluginFilePath } = message;

    new Compartment(getMockEndowments()).evaluate(
      readFileSync(pluginFilePath, 'utf8'),
    );
    setTimeout(() => process.exit(0), 1000); // Hack to ensure worker exits
  });
}

function getMockEndowments() {
  const endowments = {
    BigInt,
    Buffer,
    console,
    crypto,
    Date,
    fetch: () => true,
    Math,
    wallet: {
      registerRpcMessageHandler: () => true,
    },
    setTimeout,
    SubtleCrypto: () => undefined,
    WebSocket: () => true,
    XMLHttpRequest: () => true,
  };

  return {
    ...endowments,
    window: endowments,
  };
}
