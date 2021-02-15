import { parentPort } from 'worker_threads';
import { readFileSync } from 'fs';
import cryptography from 'crypto';

// eslint-disable-next-line import/no-unassigned-import, @typescript-eslint/no-require-imports
require('ses/lockdown');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare let lockdown: any, Compartment: any;

lockdown({
  mathTaming: 'unsafe',
  errorTaming: 'unsafe',
});

if (parentPort !== null) {
  parentPort.on('message', (message: { pluginFilePath: string }) => {
    const { pluginFilePath } = message;

    const compartment = new Compartment(getMockApi());
    // Wrap the IIFE in an arrow function, because mocking the wallet is iffy
    compartment.evaluate(
      // '() => ' + readFileSync(pluginFilePath, 'utf8')
      readFileSync(pluginFilePath, 'utf8'),
    );
    setTimeout(() => process.exit(0), 1000); // Hacky McHack
  });
}

function getMockApi() {
  return {
    console,
    wallet: {
      registerRpcMessageHandler: () => true,
    },
    BigInt,
    setTimeout,
    cryptography,
    SubtleCrypto: () => undefined,
    fetch: () => true,
    XMLHttpRequest: () => true,
    WebSocket: () => true,
    Buffer,
    Date,

    window: {
      cryptography,
      SubtleCrypto: () => undefined,
      fetch: () => true,
      XMLHttpRequest: () => true,
      WebSocket: () => true,
    },
  };
}
