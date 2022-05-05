import fs from 'fs';
import { ControllerMessenger } from '@metamask/controllers';
import {
  ErrorMessageEvent,
  ExecutionServiceMessenger,
} from '@metamask/snap-types';
import { DEFAULT_ENDOWMENTS } from '../snaps';
import { WebWorkerExecutionService } from './WebWorkerExecutionService';

const workerCode = fs.readFileSync(
  require.resolve(
    '@metamask/execution-environments/dist/webpack/webworker/bundle.js',
  ),
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
      endowments: [...DEFAULT_ENDOWMENTS],
    });

    expect(response).toStrictEqual('OK');
  });
});
