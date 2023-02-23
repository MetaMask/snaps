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

    expect(iframe.contentDocument).toBeNull();
    expect(() => iframe.contentWindow?.document).toThrow(
      /Blocked a frame with origin ".+" from accessing a cross-origin frame./u,
    );
  });
});
