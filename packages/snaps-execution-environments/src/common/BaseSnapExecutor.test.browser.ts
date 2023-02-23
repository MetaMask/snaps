/* eslint-disable @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-shadow, import/no-unassigned-import */

import { HandlerType } from '@metamask/snaps-utils';
import { MOCK_ORIGIN, MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';

import {
  getMockedStreamProvider,
  walkAndSearch,
} from './test-utils/endowments';
import { TestSnapExecutor } from './test-utils/executor';
import { testEndowmentHardening } from './test-utils/hardening';

import 'ses';

describe('BaseSnapExecutor', () => {
  before(() => {
    // @ts-expect-error - `globalThis.process` is not optional.
    delete globalThis.process;

    lockdown({
      domainTaming: 'unsafe',
      errorTaming: 'unsafe',
      stackFiltering: 'verbose',
    });
  });

  it('hardens the snap and ethereum endowments', async () => {
    const CODE = `
      module.exports.onRpcRequest = () => {
        let result = {
          hasMethods: {},
          errors: [],
        };

        try {
          result.hasMethods = {
            ethereum: {
              request: 'request' in ethereum,
              on: 'on' in ethereum,
              removeListener: 'removeListener' in ethereum,
              rpcEngine: '_rpcEngine' in ethereum,
            },
            snap: {
              request: 'request' in snap,
              on: 'on' in snap,
              removeListener: 'removeListener' in snap,
              rpcEngine: '_rpcEngine' in snap,
              requestType: typeof snap.request,
            }
          }
        } catch (error) {
          result.errors.push(error.message);
        }

        return result;
      }
    `;

    const executor = new TestSnapExecutor();
    await executor.executeSnap(1, MOCK_SNAP_ID, CODE, ['ethereum']);

    expect(await executor.readCommand()).toStrictEqual({
      jsonrpc: '2.0',
      id: 1,
      result: 'OK',
    });

    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 2,
      method: 'snapRpc',
      params: [
        MOCK_SNAP_ID,
        HandlerType.OnRpcRequest,
        MOCK_ORIGIN,
        { jsonrpc: '2.0', method: '', params: [] },
      ],
    });

    expect(await executor.readCommand()).toStrictEqual({
      jsonrpc: '2.0',
      id: 2,
      result: {
        errors: [],
        hasMethods: {
          ethereum: {
            request: true,
            on: true,
            removeListener: true,
            rpcEngine: false,
          },
          snap: {
            request: true,
            on: false,
            removeListener: false,
            rpcEngine: false,
            requestType: 'function',
          },
        },
      },
    });
  });

  ['ethereum', 'snap'].forEach((endowment) => {
    it(`properly hardens ${endowment}`, async () => {
      const CODE = `
        module.exports.onRpcRequest = () => {
          let result = 'ENDOWMENT_SECURED';
          let errors = [];

          try {
            errors = (${testEndowmentHardening})(${endowment}, () => ${endowment});
            if (${endowment}.__flag) {
              result = 'ENDOWMENT_NOT_SECURED';
            }
            if (${endowment}.__proto__ && ${endowment}.__proto__.__flag) {
              result = 'ENDOWMENT_NOT_SECURED';
            }
            if (${endowment}.prototype && ${endowment}.prototype.__flag) {
              result = 'ENDOWMENT_NOT_SECURED';
            }
            const objectProto = Object.getPrototypeOf(${endowment});
            if (objectProto.__flag) {
              result = 'ENDOWMENT_NOT_SECURED';
            }
          } catch (error) {
            return error.message;
          }

          return {
            result: result,
            errors: errors,
          };
        };
      `;

      const executor = new TestSnapExecutor();
      await executor.executeSnap(1, MOCK_SNAP_ID, CODE, ['ethereum']);

      expect(await executor.readCommand()).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: 'OK',
      });

      await executor.writeCommand({
        jsonrpc: '2.0',
        id: 2,
        method: 'snapRpc',
        params: [
          MOCK_SNAP_ID,
          HandlerType.OnRpcRequest,
          MOCK_ORIGIN,
          { jsonrpc: '2.0', method: '', params: [] },
        ],
      });

      expect(await executor.readCommand()).toStrictEqual({
        jsonrpc: '2.0',
        id: 2,
        result: {
          result: 'ENDOWMENT_SECURED',
          errors: [
            'Cannot define property __flag, object is not extensible',
            'Cannot define property __flag, object is not extensible',
            "Cannot set properties of undefined (setting '__flag')",
            "Cannot set properties of undefined (setting '__flag')",
            "Cannot set properties of undefined (setting '__flag')",
          ],
        },
      });
    });
  });

  // This test will ensure that the custom endowment does not leak reference to
  // `globalThis` by using object walker to walk object properties and search
  // for it. Because of the same architectural design of a snap and ethereum
  // endowments, it is enough to test one of them (both are StreamProviders
  // going through proxy).
  it('does not leak `globalThis` in custom endowments', async () => {
    // Because of encapsulation of the endowment implemented in
    // `BaseSnapExecutor`, mocked version is used and will reflect the same use
    // case that is suitable for security auditing of this type.
    const provider = getMockedStreamProvider();
    expect(walkAndSearch(provider, globalThis)).toBe(false);
  });

  it('does not leak real prototype in custom endowments', async () => {
    // Because of encapsulation of the endowment implemented in
    // `BaseSnapExecutor`, mocked version is used and will reflect the same use
    // case that is suitable for security auditing of this type.
    const provider = getMockedStreamProvider();
    expect(Object.getPrototypeOf(provider)).toStrictEqual({});
  });
});
