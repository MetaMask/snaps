/* eslint-disable @typescript-eslint/restrict-template-expressions */
// eslint-disable-next-line import/no-unassigned-import
import 'ses';
import { HandlerType } from '@metamask/snaps-utils';
import test from 'ava';
// FinalizationRegistry will fix type errors in tests related to network endowment.
// eslint-disable-next-line import/no-extraneous-dependencies, @typescript-eslint/no-unused-vars
import FinalizationRegistry from 'globals';

import {
  getMockedStreamProvider,
  walkAndSearch,
} from './test-utils/endowments';
import { TestSnapExecutor } from './test-utils/executor';
import { testEndowmentHardening } from './test-utils/hardening';

// Note: harden is only defined after calling lockdown
lockdown({
  domainTaming: 'unsafe',
  errorTaming: 'unsafe',
  stackFiltering: 'verbose',
});

const FAKE_ORIGIN = 'origin:foo';
const FAKE_SNAP_NAME = 'local:foo';
const ON_RPC_REQUEST = HandlerType.OnRpcRequest;
const globalThis = global;

// This test will also make visible potential errors caused by hardening
// in the execution environments, since Jest does not work as expected with SES.
// So, it is better to keep this test here for a debugging purposes.
test('ensure that a snap and ethereum endowments have expected methods', async (expect) => {
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

  await executor.executeSnap(1, FAKE_SNAP_NAME, CODE, ['ethereum']);

  expect.like(await executor.readCommand(), {
    jsonrpc: '2.0',
    id: 1,
    result: 'OK',
  });

  await executor.writeCommand({
    jsonrpc: '2.0',
    id: 2,
    method: 'snapRpc',
    params: [
      FAKE_SNAP_NAME,
      ON_RPC_REQUEST,
      FAKE_ORIGIN,
      { jsonrpc: '2.0', method: '', params: [] },
    ],
  });

  expect.like(await executor.readCommand(), {
    jsonrpc: '2.0',
    id: 2,
    result: {
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
    errors: undefined,
  });
});

const testSubjects = ['ethereum', 'snap'];

testSubjects.forEach((endowment) => {
  test(`hardening protects ${endowment} endowment`, async (expect) => {
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

    await executor.executeSnap(1, FAKE_SNAP_NAME, CODE, ['ethereum']);

    expect.like(await executor.readCommand(), {
      jsonrpc: '2.0',
      id: 1,
      result: 'OK',
    });

    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 2,
      method: 'snapRpc',
      params: [
        FAKE_SNAP_NAME,
        ON_RPC_REQUEST,
        FAKE_ORIGIN,
        { jsonrpc: '2.0', method: '', params: [] },
      ],
    });

    const hardeningTestResult = await executor.readCommand();
    // @ts-expect-error Result should be on the returned object.
    const hardeningTestErrors = hardeningTestResult.result.errors;

    expect.like(hardeningTestResult, {
      jsonrpc: '2.0',
      id: 2,
      result: {
        result: 'ENDOWMENT_SECURED',
      },
    });

    // It is expected for the errors to exist, because trying to change
    // hardened objects should result with an error
    expect.true(hardeningTestErrors.length > 0);
    expect.true(
      Boolean(
        hardeningTestErrors.find(
          (errorMessage: string) =>
            errorMessage ===
            'Cannot define property __flag, object is not extensible',
        ),
      ),
    );
  });
});

// This test will ensure that the custom endowment does not leak reference to
// global this by using object walker to walk object properties and search for it.
// Because of the same architectural design of a snap and ethereum endowments,
// it is enough to test one of them (both are StreamProviders going through proxy).
test('custom endowment does not leak globalThis', async (expect) => {
  // Because of encapsulation of the endowment implemented in BaseSnapExecutor,
  // mocked version is used and will reflect the same use case that is suitable
  // for security auditing of this type.
  const provider = getMockedStreamProvider();
  const searchResult = walkAndSearch(provider, globalThis);

  expect.is(searchResult, false);
});

test('custom endowment does not leak real prototype of the provider', async (expect) => {
  // Because of encapsulation of the endowment implemented in BaseSnapExecutor,
  // mocked version is used and will reflect the same use case that is suitable
  // for security auditing of this type.
  const provider = getMockedStreamProvider();
  const objectProto = Object.getPrototypeOf(provider);

  expect.deepEqual(objectProto, {});
});
