import fs from 'fs';
import { ControllerMessenger } from '@metamask/controllers';
import {
  ErrorMessageEvent,
  ExecutionServiceMessenger,
  UnresponsiveMessageEvent,
} from '@metamask/snap-types';
import { DEFAULT_EXPOSED_APIS } from '../snaps';
import { WebWorkerExecutionService } from './WebWorkerExecutionService';

const workerCode = fs.readFileSync(
  require.resolve('@metamask/execution-environments/dist/webworker.bundle.js'),
  'utf8',
);

describe('Worker Controller', () => {
  it('can boot', async () => {
    const messenger: ExecutionServiceMessenger =
      new ControllerMessenger().getRestricted<
        'ExecutionService',
        never,
        ErrorMessageEvent['type']
      >({
        name: 'ExecutionService',
      });
    const webWorkerExecutionService = new WebWorkerExecutionService({
      messenger,
      setupSnapProvider: () => {
        // do nothing
      },
      workerUrl: new URL('https://foo.bar.baz'),
    });
    expect(webWorkerExecutionService).toBeDefined();
  });

  it('can create a snap worker and start the snap', async () => {
    const messenger: ExecutionServiceMessenger =
      new ControllerMessenger().getRestricted<
        'ExecutionService',
        never,
        ErrorMessageEvent['type']
      >({
        name: 'ExecutionService',
      });
    const webWorkerExecutionService = new WebWorkerExecutionService({
      messenger,
      setupSnapProvider: () => {
        // do nothing
      },
      workerUrl: new URL(URL.createObjectURL(new Blob([workerCode]))),
    });
    const snapId = 'foo.bar.baz';
    const response = await webWorkerExecutionService.executeSnap({
      snapId,
      sourceCode: `
        console.log('foo');
      `,
      endowments: DEFAULT_EXPOSED_APIS,
    });

    expect(response).toStrictEqual('OK');
  });

  it('can create a snap worker and handle no ping reply', async () => {
    const messenger = new ControllerMessenger<
      never,
      UnresponsiveMessageEvent
    >().getRestricted<
      'ExecutionService',
      never,
      UnresponsiveMessageEvent['type']
    >({
      name: 'ExecutionService',
      allowedEvents: ['ExecutionService:unresponsive'],
    });
    const webWorkerExecutionService = new WebWorkerExecutionService({
      messenger,
      setupSnapProvider: () => {
        // do nothing
      },
      workerUrl: new URL(URL.createObjectURL(new Blob([workerCode]))),
    });

    const snapId = 'foo.bar.baz';
    await webWorkerExecutionService.executeSnap({
      snapId,
      sourceCode: `
        console.log('foo');
      `,
      endowments: DEFAULT_EXPOSED_APIS,
    });

    // prevent command from returning
    // eslint-disable-next-line jest/prefer-spy-on
    (webWorkerExecutionService as any)._command = jest.fn();

    // check for an error
    const promise = new Promise((resolve) => {
      messenger.subscribe('ExecutionService:unresponsive', resolve);
    });

    const result = await promise;
    expect(result).toStrictEqual(snapId);
  }, 60000);
});
