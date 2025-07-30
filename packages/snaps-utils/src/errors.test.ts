import { errorCodes, JsonRpcError, rpcErrors } from '@metamask/rpc-errors';
import {
  SnapError,
  SNAP_ERROR_CODE,
  SNAP_ERROR_MESSAGE,
} from '@metamask/snaps-sdk';
import { is } from '@metamask/superstruct';

import {
  isSerializedSnapError,
  isSnapError,
  isWrappedSnapError,
  SNAP_ERROR_WRAPPER_CODE,
  SNAP_ERROR_WRAPPER_MESSAGE,
  TrackableErrorStruct,
  unwrapError,
  WrappedSnapError,
} from './errors';

describe('WrappedSnapError', () => {
  it('wraps an error', () => {
    const error = new Error('foo');
    const wrapped = new WrappedSnapError(error);

    expect(wrapped).toBeInstanceOf(Error);
    expect(wrapped).toBeInstanceOf(WrappedSnapError);
    expect(wrapped.name).toBe('WrappedSnapError');
    expect(wrapped.message).toBe('foo');
    expect(wrapped.stack).toBeDefined();
    expect(wrapped.toJSON()).toStrictEqual({
      code: SNAP_ERROR_WRAPPER_CODE,
      message: SNAP_ERROR_WRAPPER_MESSAGE,
      data: {
        cause: {
          message: 'foo',
          stack: error.stack,
        },
      },
    });
  });

  it('wraps an error without a stack', () => {
    const error = new Error('foo');
    delete error.stack;

    const wrapped = new WrappedSnapError(error);

    expect(wrapped).toBeInstanceOf(Error);
    expect(wrapped).toBeInstanceOf(WrappedSnapError);
    expect(wrapped.name).toBe('WrappedSnapError');
    expect(wrapped.message).toBe('foo');
    expect(wrapped.stack).toBeDefined();
    expect(wrapped.toJSON()).toStrictEqual({
      code: SNAP_ERROR_WRAPPER_CODE,
      message: SNAP_ERROR_WRAPPER_MESSAGE,
      data: {
        cause: {
          message: 'foo',
        },
      },
    });
  });

  it('wraps a JSON-RPC error', () => {
    const error = new JsonRpcError(-1, 'foo');
    const wrapped = new WrappedSnapError(error);

    expect(wrapped).toBeInstanceOf(Error);
    expect(wrapped).toBeInstanceOf(WrappedSnapError);
    expect(wrapped.name).toBe('WrappedSnapError');
    expect(wrapped.message).toBe('foo');
    expect(wrapped.stack).toBeDefined();
    expect(wrapped.toJSON()).toStrictEqual({
      code: SNAP_ERROR_WRAPPER_CODE,
      message: SNAP_ERROR_WRAPPER_MESSAGE,
      data: {
        cause: {
          code: -1,
          message: 'foo',
          stack: error.stack,
        },
      },
    });
  });

  it('wraps a Snap error', () => {
    const error = new SnapError('foo');
    const wrapped = new WrappedSnapError(error);

    expect(wrapped).toBeInstanceOf(Error);
    expect(wrapped).toBeInstanceOf(WrappedSnapError);
    expect(wrapped.message).toBe('foo');
    expect(wrapped.stack).toBeDefined();
    expect(wrapped.toJSON()).toStrictEqual({
      code: SNAP_ERROR_WRAPPER_CODE,
      message: SNAP_ERROR_WRAPPER_MESSAGE,
      data: {
        cause: {
          code: SNAP_ERROR_CODE,
          message: SNAP_ERROR_MESSAGE,
          data: {
            cause: {
              code: -32603,
              message: 'foo',
              stack: error.stack,
            },
          },
        },
      },
    });
  });

  describe('serialize', () => {
    it('serializes the wrapped error', () => {
      const error = new SnapError('foo');
      const wrapped = new WrappedSnapError(error);

      expect(wrapped.serialize()).toStrictEqual({
        code: SNAP_ERROR_WRAPPER_CODE,
        message: SNAP_ERROR_WRAPPER_MESSAGE,
        data: {
          cause: {
            code: SNAP_ERROR_CODE,
            message: SNAP_ERROR_MESSAGE,
            data: {
              cause: {
                code: -32603,
                message: 'foo',
                stack: error.stack,
              },
            },
          },
        },
      });
    });
  });
});

describe('isSnapError', () => {
  it('returns true if the error is a Snap error', () => {
    const error = new SnapError('foo');

    expect(isSnapError(error)).toBe(true);
  });

  it('returns false if the error is not a Snap error', () => {
    const error = new Error('foo');

    expect(isSnapError(error)).toBe(false);
  });
});

describe('isSerializedSnapError', () => {
  it('returns true if the error is a serialized Snap error', () => {
    const error = new SnapError('foo').toJSON();

    expect(isSerializedSnapError(error)).toBe(true);
  });

  it('returns false if the error is not a serialized Snap error', () => {
    const error = {
      code: -32603,
      message: 'foo',
    };

    expect(isSerializedSnapError(error)).toBe(false);
  });
});

describe('isWrappedSnapError', () => {
  it('returns true if the error is a Snap error wrapper', () => {
    const error = new WrappedSnapError(new Error('foo')).toJSON();

    expect(isWrappedSnapError(error)).toBe(true);
  });

  it('returns false if the error is not a Snap error wrapper', () => {
    const error = new Error('foo');

    expect(isWrappedSnapError(error)).toBe(false);
  });
});

describe('unwrapError', () => {
  it('unwraps a wrapped Snap error with an unknown error', () => {
    const error = new Error('foo');
    const wrapped = new WrappedSnapError(error).toJSON();

    const [unwrappedError, handled] = unwrapError(wrapped);

    expect(unwrappedError).toBeInstanceOf(Error);
    expect(unwrappedError.code).toBe(errorCodes.rpc.internal);
    expect(unwrappedError.message).toBe('foo');
    expect(unwrappedError.stack).toBeDefined();
    expect(handled).toBe(false);
  });

  it('unwraps a wrapped Snap error with a JSON-RPC error', () => {
    const error = new JsonRpcError(-1, 'foo');
    const wrapped = new WrappedSnapError(error).toJSON();

    const [unwrappedError, handled] = unwrapError(wrapped);

    expect(unwrappedError).toBeInstanceOf(Error);
    expect(unwrappedError.code).toBe(-1);
    expect(unwrappedError.message).toBe('foo');
    expect(unwrappedError.stack).toBeDefined();
    expect(handled).toBe(false);
  });

  it('unwraps a wrapped Snap error with a `rpc-errors` error', () => {
    const error = rpcErrors.invalidParams('foo');
    const wrapped = new WrappedSnapError(error).toJSON();

    const [unwrappedError, handled] = unwrapError(wrapped);

    expect(unwrappedError).toBeInstanceOf(Error);
    expect(unwrappedError.code).toBe(errorCodes.rpc.invalidParams);
    expect(unwrappedError.message).toBe('foo');
    expect(unwrappedError.stack).toBeDefined();
    expect(handled).toBe(false);
  });

  it('unwraps a wrapped Snap error with a wrapped Snap error', () => {
    const error = new SnapError('foo');
    const wrapped = new WrappedSnapError(error).toJSON();

    const [unwrappedError, handled] = unwrapError(wrapped);

    expect(unwrappedError).toBeInstanceOf(Error);
    expect(unwrappedError.code).toBe(-32603);
    expect(unwrappedError.message).toBe('foo');
    expect(unwrappedError.stack).toBeDefined();
    expect(handled).toBe(true);
  });

  it('unwraps a wrapped Snap error with a wrapped Snap error and code', () => {
    const error = new SnapError({
      message: 'foo',
      code: -32000,
    });

    const wrapped = new WrappedSnapError(error).toJSON();
    const [unwrappedError, handled] = unwrapError(wrapped);

    expect(unwrappedError).toBeInstanceOf(Error);
    expect(unwrappedError.code).toBe(-32000);
    expect(unwrappedError.message).toBe('foo');
    expect(unwrappedError.stack).toBeDefined();
    expect(handled).toBe(true);
  });

  it('unwraps a wrapped Snap error with a wrapped Snap error and data', () => {
    const error = new SnapError('foo', { foo: 'bar' });

    const wrapped = new WrappedSnapError(error).toJSON();
    const [unwrappedError, handled] = unwrapError(wrapped);

    expect(unwrappedError).toBeInstanceOf(Error);
    expect(unwrappedError.code).toBe(-32603);
    expect(unwrappedError.message).toBe('foo');
    expect(unwrappedError.stack).toBeDefined();
    expect(unwrappedError.data).toStrictEqual({
      foo: 'bar',
    });
    expect(handled).toBe(true);
  });

  it('unwraps an unwrapped JSON-RPC error', () => {
    const error = new JsonRpcError(-1, 'foo');

    const [unwrappedError, handled] = unwrapError(error);

    expect(unwrappedError).toBeInstanceOf(Error);
    expect(unwrappedError.code).toBe(-1);
    expect(unwrappedError.message).toBe('foo');
    expect(unwrappedError.stack).toBeDefined();
    expect(handled).toBe(false);
  });

  it('unwraps an unwrapped `rpc-errors` error', () => {
    const error = rpcErrors.invalidParams('foo');

    const [unwrappedError, handled] = unwrapError(error);

    expect(unwrappedError).toBeInstanceOf(Error);
    expect(unwrappedError.code).toBe(errorCodes.rpc.invalidParams);
    expect(unwrappedError.message).toBe('foo');
    expect(unwrappedError.stack).toBeDefined();
    expect(handled).toBe(false);
  });

  it('unwraps an unknown error', () => {
    const error = new Error('foo');

    const [unwrappedError, handled] = unwrapError(error);

    expect(unwrappedError).toBeInstanceOf(Error);
    expect(unwrappedError.code).toBe(errorCodes.rpc.internal);
    expect(unwrappedError.message).toBe('foo');
    expect(unwrappedError.stack).toBeDefined();
    expect(handled).toBe(false);
  });

  it('unwraps an error without a stack', () => {
    const error = new Error('foo');
    delete error.stack;

    const [unwrappedError, handled] = unwrapError(error);

    expect(unwrappedError).toBeInstanceOf(Error);
    expect(unwrappedError.code).toBe(errorCodes.rpc.internal);
    expect(unwrappedError.message).toBe('foo');
    expect(unwrappedError.stack).toBeUndefined();
    expect(handled).toBe(false);
  });

  it('unwraps double wrapped JSON-RPC errors', () => {
    const error = new JsonRpcError(-31001, 'Wrapped Snap Error', {
      cause: {
        code: -32603,
        message: 'Invalid URL: Unable to parse URL.',
        data: {
          cause: {
            message: 'Invalid URL: Unable to parse URL.',
            stack: `Error: Invalid URL: Unable to parse URL.
      at validateLink (chrome-extension://oghgfmogdanabdcdccbeoodiboikbejn/common-4.js:11793:15)
      at chrome-extension://oghgfmogdanabdcdccbeoodiboikbejn/common-4.js:11842:17
      at walkJsx (chrome-extension://oghgfmogdanabdcdccbeoodiboikbejn/common-4.js:11936:20)
      at walkJsx (chrome-extension://oghgfmogdanabdcdccbeoodiboikbejn/common-4.js:11946:37)
      at validateJsxElements (chrome-extension://oghgfmogdanabdcdccbeoodiboikbejn/common-4.js:11839:5)
      at SnapInterfaceController._SnapInterfaceController_validateContent (chrome-extension://oghgfmogdanabdcdccbeoodiboikbejn/background-5.js:21741:43)
      at SnapInterfaceController.createInterface (chrome-extension://oghgfmogdanabdcdccbeoodiboikbejn/background-5.js:21585:127)
      at Messenger.call (chrome-extension://oghgfmogdanabdcdccbeoodiboikbejn/common-1.js:14706:16)
      at dialogImplementation (chrome-extension://oghgfmogdanabdcdccbeoodiboikbejn/common-4.js:1988:30)
      at PermissionController._executeRestrictedMethod (chrome-extension://oghgfmogdanabdcdccbeoodiboikbejn/common-3.js:23611:111)`,
          },
        },
      },
    });

    const [unwrappedError, handled] = unwrapError(error);
    expect(handled).toBe(false);
    expect(unwrappedError.message).toBe('Invalid URL: Unable to parse URL.');
    expect(unwrappedError.stack).toStrictEqual(
      expect.stringContaining('PermissionController._executeRestrictedMethod'),
    );
  });
});

describe('TrackableError', () => {
  it.each([
    {
      name: 'TestError',
      message: 'Test error',
      stack: 'Error stack trace',
      cause: null,
    },
    {
      name: 'TestError',
      message: 'Test error',
      stack: null,
      cause: {
        name: 'CauseError',
        message: 'Cause error',
        stack: 'Cause error stack trace',
        cause: {
          name: 'NestedCauseError',
          message: 'Nested cause error',
          stack: 'Nested cause error stack trace',
          cause: null,
        },
      },
    },
    {
      name: 'TestError',
      message: 'Test error',
      stack: null,
      cause: null,
    },
  ])('validates a trackable error', (value) => {
    expect(is(value, TrackableErrorStruct)).toBe(true);
  });

  it.each([
    true,
    false,
    0,
    'TestError',
    { name: 'TestError' },
    { message: 'Test error' },
    { stack: 'Error stack trace' },
    { cause: null },
    {
      name: 'TestError',
      message: 'Test error',
      stack: 'Error stack trace',
      cause: {},
    },
  ])('validates an invalid trackable error', (value) => {
    expect(is(value, TrackableErrorStruct)).toBe(false);
  });
});
