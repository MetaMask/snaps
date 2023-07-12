import { createService } from '@metamask/snaps-controllers/test-utils';
import {
  DEFAULT_SNAP_BUNDLE,
  MOCK_LOCAL_SNAP_ID,
  MOCK_SNAP_ID,
} from '@metamask/snaps-utils/test-utils';
import type { Json, JsonRpcRequest } from '@metamask/utils';
import { isJsonRpcRequest, isPlainObject } from '@metamask/utils';

import { getMockedFunction } from '../../test-utils/mock';
import { OffscreenExecutionService } from './OffscreenExecutionService';

const DOCUMENT_URL = new URL('https://foo');
const FRAME_URL = new URL('https://bar');

/**
 * Create a response message for the given request. This function assumes that
 * the response is for the parent, and uses the command stream.
 *
 * @param message - The request message.
 * @param request - The request to respond to.
 * @param response - The response to send.
 * @returns The response message.
 */
function getResponse(
  message: Record<string, unknown>,
  request: JsonRpcRequest,
  response: Json,
) {
  return {
    target: 'parent',
    data: {
      jobId: message.jobId,
      frameUrl: message.frameUrl,
      data: {
        name: 'command',
        data: {
          jsonrpc: '2.0',
          id: request.id,
          result: response,
        },
      },
    },
  };
}

describe('OffscreenExecutionService', () => {
  beforeEach(() => {
    const addListener = jest.fn();
    const sendMessage = jest.fn().mockImplementation((message) => {
      // Propagate message to all listeners.
      addListener.mock.calls.forEach(([listener]) => {
        setTimeout(() => listener(message));
      });
    });

    // Since we can't easily run the offscreen execution service in a real
    // environment, we mock the responses that are expected from the service.
    addListener((message: Record<string, unknown>) => {
      const { target, data } = message;

      if (target !== 'child') {
        return;
      }

      // Respond with a handshake acknowledgement.
      if (data === 'SYN') {
        sendMessage({ target: 'parent', data: 'ACK' });
      }

      // Handle incoming requests.
      if (
        isPlainObject(data) &&
        isPlainObject(data.data) &&
        data.data.name === 'command' &&
        isJsonRpcRequest(data.data.data)
      ) {
        const request = data.data.data;

        // Respond "OK" to the `ping`, `executeSnap`, and `terminate` request.
        if (
          request.method === 'ping' ||
          request.method === 'executeSnap' ||
          request.method === 'terminate'
        ) {
          sendMessage(getResponse(data, request, 'OK'));
        }
      }
    });

    Object.assign(global, {
      chrome: {
        runtime: {
          sendMessage,
          onMessage: {
            addListener,
            removeListener: jest.fn(),
          },
        },

        offscreen: {
          hasDocument: jest.fn(),
          createDocument: jest.fn(),
        },
      },
    });
  });

  it('can boot', async () => {
    const { service } = createService(OffscreenExecutionService, {
      documentUrl: DOCUMENT_URL,
      frameUrl: FRAME_URL,
    });

    expect(service).toBeDefined();
    await service.terminateAllSnaps();
  });

  it('creates a document if it does not exist', async () => {
    const { service } = createService(OffscreenExecutionService, {
      documentUrl: DOCUMENT_URL,
      frameUrl: FRAME_URL,
    });

    const hasDocument = chrome.offscreen.hasDocument as jest.MockedFunction<
      () => Promise<boolean>
    >;
    const createDocument = getMockedFunction(chrome.offscreen.createDocument);

    hasDocument.mockResolvedValueOnce(false).mockResolvedValue(true);

    expect(hasDocument).not.toHaveBeenCalled();
    expect(createDocument).not.toHaveBeenCalled();

    // Run two snaps to ensure that the document is created only once.
    expect(
      await service.executeSnap({
        snapId: MOCK_SNAP_ID,
        sourceCode: DEFAULT_SNAP_BUNDLE,
      }),
    ).toBe('OK');

    expect(
      await service.executeSnap({
        snapId: MOCK_LOCAL_SNAP_ID,
        sourceCode: DEFAULT_SNAP_BUNDLE,
      }),
    ).toBe('OK');

    expect(hasDocument).toHaveBeenCalledTimes(2);
    expect(createDocument).toHaveBeenCalledTimes(1);
    expect(createDocument).toHaveBeenCalledWith({
      justification: 'MetaMask Snaps Execution Environment',
      reasons: ['IFRAME_SCRIPTING'],
      url: DOCUMENT_URL.toString(),
    });

    await service.terminateAllSnaps();
  });

  it('writes a termination command to the stream', async () => {
    const { service } = createService(OffscreenExecutionService, {
      documentUrl: DOCUMENT_URL,
      frameUrl: FRAME_URL,
    });

    expect(
      await service.executeSnap({
        snapId: MOCK_SNAP_ID,
        sourceCode: DEFAULT_SNAP_BUNDLE,
      }),
    ).toBe('OK');

    await service.terminateSnap(MOCK_SNAP_ID);

    const sendMessage = getMockedFunction(chrome.runtime.sendMessage);
    expect(sendMessage).toHaveBeenLastCalledWith({
      target: 'child',
      data: {
        jobId: expect.any(String),
        data: {
          jsonrpc: '2.0',
          id: expect.any(String),
          method: 'terminateJob',
        },
      },
    });
  });
});
