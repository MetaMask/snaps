import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import type { InterfaceState } from '@metamask/snaps-sdk';
import { type GetInterfaceStateResult } from '@metamask/snaps-sdk';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';

import {
  getInterfaceStateHandler,
  getLegacyInterfaceState,
} from './getInterfaceState';
import type { UpdateInterfaceParameters } from './updateInterface';

describe('getLegacyInterfaceState', () => {
  it('returns the legacy state', () => {
    const state: InterfaceState = {
      foo: {
        value: 'bar',
        type: 'Input',
      },
      baz: {
        value: 'qux',
        type: 'Dropdown',
      },
      quux: {
        value: {
          name: 'file.txt',
          contentType: 'text/plain',
          size: 42,
          contents: 'base64',
        },
        type: 'FileInput',
      },
    };

    const legacyState = getLegacyInterfaceState(state);
    expect(legacyState).toStrictEqual({
      foo: 'bar',
      baz: 'qux',
      quux: {
        name: 'file.txt',
        contentType: 'text/plain',
        size: 42,
        contents: 'base64',
      },
    });
  });

  it('returns the legacy state with form state', () => {
    const state: InterfaceState = {
      form: {
        type: 'Form',
        value: {
          foo: {
            value: 'bar',
            type: 'Input',
          },
          baz: {
            value: 'qux',
            type: 'Dropdown',
          },
          quux: {
            value: {
              name: 'file.txt',
              contentType: 'text/plain',
              size: 42,
              contents: 'base64',
            },
            type: 'FileInput',
          },
        },
      },
      input: {
        value: 'input',
        type: 'Input',
      },
    };

    const legacyState = getLegacyInterfaceState(state);
    expect(legacyState).toStrictEqual({
      form: {
        foo: 'bar',
        baz: 'qux',
        quux: {
          name: 'file.txt',
          contentType: 'text/plain',
          size: 42,
          contents: 'base64',
        },
      },
      input: 'input',
    });
  });

  it('returns the legacy state with form state containing an input named type and value', () => {
    const state: InterfaceState = {
      form: {
        type: 'Form',
        value: {
          type: {
            value: 'bar',
            type: 'Input',
          },
          value: {
            value: 'qux',
            type: 'Dropdown',
          },
        },
      },
      input: {
        value: 'input',
        type: 'Input',
      },
    };

    const legacyState = getLegacyInterfaceState(state);
    expect(legacyState).toStrictEqual({
      form: {
        type: 'bar',
        value: 'qux',
      },
      input: 'input',
    });
  });
});

describe('snap_getInterfaceState', () => {
  describe('getInterfaceStateHandler', () => {
    it('has the expected shape', () => {
      expect(getInterfaceStateHandler).toMatchObject({
        methodNames: ['snap_getInterfaceState'],
        implementation: expect.any(Function),
        hookNames: {
          getInterfaceState: true,
        },
      });
    });
  });

  describe('implementation', () => {
    it('returns the result from the `getInterfaceState` hook', async () => {
      const { implementation } = getInterfaceStateHandler;

      const getInterfaceState = jest.fn().mockReturnValue({
        foo: {
          type: 'Input',
          value: 'bar',
        },
      });

      const hooks = {
        getInterfaceState,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<UpdateInterfaceParameters>,
          response as PendingJsonRpcResponse<GetInterfaceStateResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_getInterfaceState',
        params: {
          id: 'foo',
        },
      });

      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: { foo: 'bar' },
      });
    });

    it('throws on invalid params', async () => {
      const { implementation } = getInterfaceStateHandler;

      const getInterfaceState = jest.fn().mockReturnValue({ foo: 'bar' });

      const hooks = {
        getInterfaceState,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<UpdateInterfaceParameters>,
          response as PendingJsonRpcResponse<GetInterfaceStateResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_getInterfaceState',
        params: {
          id: 42,
        },
      });

      expect(response).toStrictEqual({
        error: {
          code: -32602,
          message:
            'Invalid params: At path: id -- Expected a string, but received: 42.',
          stack: expect.any(String),
        },
        id: 1,
        jsonrpc: '2.0',
      });
    });
  });
});
