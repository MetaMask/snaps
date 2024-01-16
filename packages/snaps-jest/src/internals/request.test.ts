import { HandlerType } from '@metamask/snaps-utils';

import { getMockServer } from '../test-utils';
import { handleRequest } from './request';
import { handleInstallSnap } from './simulation';

describe('handleRequest', () => {
  it('sends a JSON-RPC request and returns the response', async () => {
    const { snapId, close: closeServer } = await getMockServer({
      sourceCode: `
        module.exports.onRpcRequest = async (request) => {
          return 'Hello, world!';
        };
      `,
    });

    const snap = await handleInstallSnap(snapId);
    const response = await handleRequest({
      ...snap,
      handler: HandlerType.OnRpcRequest,
      request: {
        method: 'foo',
        params: ['bar'],
      },
    });

    expect(response).toStrictEqual({
      content: undefined,
      id: expect.any(String),
      response: {
        result: 'Hello, world!',
      },
      notifications: [],
    });

    await closeServer();
    await snap.executionService.terminateAllSnaps();
  });

  it('returns an error response', async () => {
    const { snapId, close: closeServer } = await getMockServer({
      sourceCode: `
        module.exports.onRpcRequest = async (request) => {
          throw new Error('Something went wrong.');
        };
      `,
    });

    const snap = await handleInstallSnap(snapId);
    const response = await handleRequest({
      ...snap,
      handler: HandlerType.OnRpcRequest,
      request: {
        method: 'foo',
        params: ['bar'],
      },
    });

    expect(response).toStrictEqual({
      id: expect.any(String),
      response: {
        error: expect.objectContaining({
          code: -32603,
          message: 'Something went wrong.',
        }),
      },
      notifications: [],
    });

    await closeServer();
    await snap.executionService.terminateAllSnaps();
  });
});
