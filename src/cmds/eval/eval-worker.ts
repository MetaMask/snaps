import { EventEmitter } from 'events';
import { parentPort } from 'worker_threads';
import { readFileSync } from 'fs';
import crypto from 'crypto';

// eslint-disable-next-line import/no-unassigned-import
import 'ses/lockdown';

declare let lockdown: any, Compartment: any;

type MockSnapProvider = EventEmitter & {
  registerRpcMessageHandler: () => any;
  request: () => Promise<any>;
};

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

function getMockSnapProvider(): MockSnapProvider {
  const mockProvider = new EventEmitter() as Partial<MockSnapProvider>;
  mockProvider.registerRpcMessageHandler = () => true;
  mockProvider.request = async () => true;
  return mockProvider as MockSnapProvider;
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
    wallet: getMockSnapProvider(),
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
