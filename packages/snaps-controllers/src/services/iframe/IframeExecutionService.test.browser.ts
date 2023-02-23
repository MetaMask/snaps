import { createService } from '@metamask/snaps-controllers/test-utils';
import { HandlerType } from '@metamask/snaps-utils';
import {
  DEFAULT_SNAP_BUNDLE,
  MOCK_ORIGIN,
  MOCK_SNAP_ID,
} from '@metamask/snaps-utils/test-utils';
import { assert } from '@metamask/utils';

import { IframeExecutionService } from './IframeExecutionService';

describe('IframeExecutionService', () => {
  it('executes a snap', async () => {
    const { service } = createService(IframeExecutionService, {
      iframeUrl: new URL('http://localhost:4567'),
    });

    await service.executeSnap({
      snapId: MOCK_SNAP_ID,
      sourceCode: DEFAULT_SNAP_BUNDLE,
      endowments: ['console'],
    });

    const result = await service.handleRpcRequest(MOCK_SNAP_ID, {
      origin: MOCK_ORIGIN,
      handler: HandlerType.OnRpcRequest,
      request: {
        jsonrpc: '2.0',
        id: 1,
        method: 'foo',
      },
    });

    expect(result).toBe('foo1');

    await service.terminateAllSnaps();
  });

  it('properly sandboxes the iframe', async () => {
    const { service } = createService(IframeExecutionService, {
      iframeUrl: new URL('http://localhost:4567'),
    });

    await service.executeSnap({
      snapId: MOCK_SNAP_ID,
      sourceCode: DEFAULT_SNAP_BUNDLE,
      endowments: ['console'],
    });

    const iframe = document.querySelector('iframe');
    assert(iframe);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const message = new Promise((resolve) => {
      window.addEventListener('message', (event) => {
        resolve(event.data);
      });
    });

    // Creates an iframe attempts to access the iframe created by the execution
    // service. This should fail due to the sandboxing.
    const testFrame = document.createElement('iframe');
    testFrame.src = 'http://localhost:4567/test/sandbox';
    document.body.appendChild(testFrame);

    expect(await message).toBe(
      'SecurityError: Blocked a frame with origin "http://localhost:4567" from accessing a cross-origin frame.',
    );
  });
});
