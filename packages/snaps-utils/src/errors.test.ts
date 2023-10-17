import { rpcErrors } from '@metamask/rpc-errors';

import {
  getErrorMessage,
  SNAP_ERROR_CODE,
  SNAP_ERROR_MESSAGE,
  SNAP_ERROR_WRAPPER_CODE,
  SNAP_ERROR_WRAPPER_MESSAGE,
  SnapError,
  UnhandledSnapError,
} from './errors';

describe('getErrorMessage', () => {
  it('returns the error message if the error is an object with a message property', () => {
    expect(getErrorMessage(new Error('foo'))).toBe('foo');
    expect(getErrorMessage({ message: 'foo' })).toBe('foo');
    expect(getErrorMessage(rpcErrors.invalidParams('foo'))).toBe('foo');
  });

  it('returns the error converted to a string if the error does not have a message property', () => {
    expect(getErrorMessage('foo')).toBe('foo');
    expect(getErrorMessage(123)).toBe('123');
    expect(getErrorMessage(true)).toBe('true');
    expect(getErrorMessage(null)).toBe('null');
    expect(getErrorMessage(undefined)).toBe('undefined');
    expect(getErrorMessage({ foo: 'bar' })).toBe('[object Object]');
  });
});

describe('SnapErrorWrapper', () => {
  it('wraps an error', () => {
    const error = new Error('foo');
    const wrapped = new UnhandledSnapError(error);

    expect(wrapped).toBeInstanceOf(Error);
    expect(wrapped).toBeInstanceOf(UnhandledSnapError);
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

  it('wraps a Snap error', () => {
    const error = new SnapError('foo');
    const wrapped = new UnhandledSnapError(error);

    expect(wrapped).toBeInstanceOf(Error);
    expect(wrapped).toBeInstanceOf(UnhandledSnapError);
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
              data: {
                stack: error.stack,
              },
            },
          },
        },
      },
    });
  });
});

describe('SnapError', () => {
  it('creates an error from a message', () => {
    const error = new SnapError('foo');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(SnapError);
    expect(error.message).toBe('foo');
    expect(error.code).toBe(-32603);
    expect(error.data).toStrictEqual({});
    expect(error.stack).toBeDefined();
    expect(error.toJSON()).toStrictEqual({
      code: -32603,
      message: 'foo',
      data: {
        stack: error.stack,
      },
    });
  });

  it('creates an error from a message and code', () => {
    const error = new SnapError({
      message: 'foo',
      code: -32000,
    });

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(SnapError);
    expect(error.message).toBe('foo');
    expect(error.code).toBe(-32000);
    expect(error.data).toStrictEqual({});
    expect(error.stack).toBeDefined();
    expect(error.toJSON()).toStrictEqual({
      code: -32000,
      message: 'foo',
      data: {
        stack: error.stack,
      },
    });
  });

  it('creates an error from a message and data', () => {
    const error = new SnapError('foo', { foo: 'bar' });

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(SnapError);
    expect(error.message).toBe('foo');
    expect(error.code).toBe(-32603);
    expect(error.data).toStrictEqual({ foo: 'bar' });
    expect(error.stack).toBeDefined();
  });

  it('creates an error from a message, code, and data', () => {
    const error = new SnapError(
      {
        message: 'foo',
        code: -32000,
      },
      { foo: 'bar' },
    );

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(SnapError);
    expect(error.message).toBe('foo');
    expect(error.code).toBe(-32000);
    expect(error.data).toStrictEqual({ foo: 'bar' });
    expect(error.stack).toBeDefined();
    expect(error.toJSON()).toStrictEqual({
      code: -32000,
      message: 'foo',
      data: {
        foo: 'bar',
        stack: error.stack,
      },
    });
  });

  it('creates an error from an error', () => {
    const error = new SnapError(new Error('foo'));

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(SnapError);
    expect(error.message).toBe('foo');
    expect(error.code).toBe(-32603);
    expect(error.data).toStrictEqual({});
    expect(error.stack).toBeDefined();
    expect(error.toJSON()).toStrictEqual({
      code: -32603,
      message: 'foo',
      data: {
        stack: error.stack,
      },
    });
  });

  it('creates an error from an error and data', () => {
    const error = new SnapError(new Error('foo'), { foo: 'bar' });

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(SnapError);
    expect(error.message).toBe('foo');
    expect(error.code).toBe(-32603);
    expect(error.data).toStrictEqual({ foo: 'bar' });
    expect(error.stack).toBeDefined();
    expect(error.toJSON()).toStrictEqual({
      code: -32603,
      message: 'foo',
      data: {
        foo: 'bar',
        stack: error.stack,
      },
    });
  });

  it('creates an error from a JsonRpcError', () => {
    const error = new SnapError(rpcErrors.invalidParams('foo'));

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(SnapError);
    expect(error.message).toBe('foo');
    expect(error.code).toBe(-32602);
    expect(error.data).toStrictEqual({});
    expect(error.stack).toBeDefined();
    expect(error.toJSON()).toStrictEqual({
      code: -32602,
      message: 'foo',
      data: {
        stack: error.stack,
      },
    });
  });

  it('creates an error from a JsonRpcError and data', () => {
    const error = new SnapError(rpcErrors.invalidParams('foo'), {
      foo: 'bar',
    });

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(SnapError);
    expect(error.message).toBe('foo');
    expect(error.code).toBe(-32602);
    expect(error.data).toStrictEqual({ foo: 'bar' });
    expect(error.stack).toBeDefined();
    expect(error.toJSON()).toStrictEqual({
      code: -32602,
      message: 'foo',
      data: {
        foo: 'bar',
        stack: error.stack,
      },
    });
  });

  it('creates an error from a JsonRpcError with a code of 0', () => {
    const error = new SnapError({
      message: 'foo',
      code: 0,
    });

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(SnapError);
    expect(error.message).toBe('foo');
    expect(error.code).toBe(0);
    expect(error.data).toStrictEqual({});
    expect(error.stack).toBeDefined();
    expect(error.toJSON()).toStrictEqual({
      code: 0,
      message: 'foo',
      data: {
        stack: error.stack,
      },
    });
  });

  it('creates an error from a JsonRpcError with a code of 0 and data', () => {
    const error = new SnapError(
      {
        message: 'foo',
        code: 0,
      },
      { foo: 'bar' },
    );

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(SnapError);
    expect(error.message).toBe('foo');
    expect(error.code).toBe(0);
    expect(error.data).toStrictEqual({ foo: 'bar' });
    expect(error.stack).toBeDefined();
    expect(error.toJSON()).toStrictEqual({
      code: 0,
      message: 'foo',
      data: {
        foo: 'bar',
        stack: error.stack,
      },
    });
  });

  it('creates an error from a JsonRpcError with a code of 0 and merges the data', () => {
    const error = new SnapError(
      {
        message: 'foo',
        code: 0,
        data: {
          foo: 'baz',
          bar: 'qux',
        },
      },
      { foo: 'bar' },
    );

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(SnapError);
    expect(error.message).toBe('foo');
    expect(error.code).toBe(0);
    expect(error.data).toStrictEqual({ foo: 'bar', bar: 'qux' });
    expect(error.stack).toBeDefined();
    expect(error.toJSON()).toStrictEqual({
      code: 0,
      message: 'foo',
      data: {
        foo: 'bar',
        bar: 'qux',
        stack: error.stack,
      },
    });
  });
});
