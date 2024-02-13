import { errorCodes, JsonRpcError, rpcErrors } from '@metamask/rpc-errors';
import {
  SnapError,
  SNAP_ERROR_CODE,
  SNAP_ERROR_MESSAGE,
} from '@metamask/snaps-sdk';

import {
  isSerializedSnapError,
  isSnapError,
  isWrappedSnapError,
  SNAP_ERROR_WRAPPER_CODE,
  SNAP_ERROR_WRAPPER_MESSAGE,
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
});
