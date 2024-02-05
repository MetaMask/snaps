import { SnapInterfaceController } from '@metamask/snaps-controllers';
import type { SnapId } from '@metamask/snaps-sdk';
import { text } from '@metamask/snaps-sdk';
import { HandlerType } from '@metamask/snaps-utils';

import {
  getMockServer,
  getRestrictedSnapInterfaceControllerMessenger,
  getRootControllerMessenger,
} from '../test-utils';
import { getContentFromResult, handleRequest } from './request';
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

  it('can get an interface from the SnapInterfaceController if the result contains an id', async () => {
    const controllerMessenger = getRootControllerMessenger();

    const interfaceController = new SnapInterfaceController({
      messenger:
        getRestrictedSnapInterfaceControllerMessenger(controllerMessenger),
    });

    const content = text('foo');
    const id = await interfaceController.createInterface(
      'local:http://localhost:4242' as SnapId,
      content,
    );

    const { snapId, close: closeServer } = await getMockServer({
      sourceCode: `
        module.exports.onHomePage = async (request) => {
          return ({ id: '${id}' });
        };
      `,
      port: 4242,
    });

    const snap = await handleInstallSnap(snapId);
    const response = await handleRequest({
      ...snap,
      controllerMessenger,
      handler: HandlerType.OnHomePage,
      request: {
        method: '',
      },
    });

    expect(response).toStrictEqual({
      id: expect.any(String),
      response: {
        result: {
          id,
        },
      },
      notifications: [],
      content,
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

describe('getContentFromResult', () => {
  it('gets the content from the SnapInterfaceController if the result contains an ID', async () => {
    const controllerMessenger = getRootControllerMessenger();
    const interfaceController = new SnapInterfaceController({
      messenger:
        getRestrictedSnapInterfaceControllerMessenger(controllerMessenger),
    });

    const snapId = 'foo' as SnapId;
    const content = text('foo');

    const id = await interfaceController.createInterface(snapId, content);

    const result = getContentFromResult({ id }, snapId, controllerMessenger);

    expect(result).toStrictEqual(content);
  });

  it('gets the content from the result if the result contains the content', () => {
    const controllerMessenger = getRootControllerMessenger();

    const snapId = 'foo' as SnapId;
    const content = text('foo');

    const result = getContentFromResult(
      { content },
      snapId,
      controllerMessenger,
    );

    expect(result).toStrictEqual(content);
  });

  it('returns undefined if there is no content associated with the result', () => {
    const controllerMessenger = getRootControllerMessenger();

    const snapId = 'foo' as SnapId;

    const result = getContentFromResult({}, snapId, controllerMessenger);

    expect(result).toBeUndefined();
  });
});
