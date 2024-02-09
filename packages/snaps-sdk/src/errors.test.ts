import { rpcErrors } from '@metamask/rpc-errors';

import { SnapError } from './errors';

describe('SnapError', () => {
  it('creates an error from a message', () => {
    const error = new SnapError('foo');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(SnapError);
    expect(error.message).toBe('foo');
    expect(error.code).toBe(-32603);
    expect(error.data).toBeUndefined();
    expect(error.stack).toBeDefined();
    expect(error.toJSON()).toStrictEqual({
      code: -31002,
      message: 'Snap Error',
      data: {
        cause: {
          code: -32603,
          message: 'foo',
          stack: error.stack,
        },
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
    expect(error.data).toBeUndefined();
    expect(error.stack).toBeDefined();
    expect(error.toJSON()).toStrictEqual({
      code: -31002,
      message: 'Snap Error',
      data: {
        cause: {
          code: -32000,
          message: 'foo',
          stack: error.stack,
        },
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
      code: -31002,
      message: 'Snap Error',
      data: {
        cause: {
          code: -32000,
          message: 'foo',
          stack: error.stack,
          data: {
            foo: 'bar',
          },
        },
      },
    });
  });

  it('creates an error from an error', () => {
    const error = new SnapError(new Error('foo'));

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(SnapError);
    expect(error.message).toBe('foo');
    expect(error.code).toBe(-32603);
    expect(error.data).toBeUndefined();
    expect(error.stack).toBeDefined();
    expect(error.toJSON()).toStrictEqual({
      code: -31002,
      message: 'Snap Error',
      data: {
        cause: {
          code: -32603,
          message: 'foo',
          stack: error.stack,
        },
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
      code: -31002,
      message: 'Snap Error',
      data: {
        cause: {
          code: -32603,
          message: 'foo',
          stack: error.stack,
          data: {
            foo: 'bar',
          },
        },
      },
    });
  });

  it('creates an error from a JsonRpcError', () => {
    const error = new SnapError(rpcErrors.invalidParams('foo'));

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(SnapError);
    expect(error.message).toBe('foo');
    expect(error.code).toBe(-32602);
    expect(error.data).toBeUndefined();
    expect(error.stack).toBeDefined();
    expect(error.toJSON()).toStrictEqual({
      code: -31002,
      message: 'Snap Error',
      data: {
        cause: {
          code: -32602,
          message: 'foo',
          stack: error.stack,
        },
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
      code: -31002,
      message: 'Snap Error',
      data: {
        cause: {
          code: -32602,
          message: 'foo',
          stack: error.stack,
          data: {
            foo: 'bar',
          },
        },
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
    expect(error.data).toBeUndefined();
    expect(error.stack).toBeDefined();
    expect(error.toJSON()).toStrictEqual({
      code: -31002,
      message: 'Snap Error',
      data: {
        cause: {
          code: 0,
          message: 'foo',
          stack: error.stack,
        },
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
      code: -31002,
      message: 'Snap Error',
      data: {
        cause: {
          code: 0,
          message: 'foo',
          stack: error.stack,
          data: {
            foo: 'bar',
          },
        },
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
      code: -31002,
      message: 'Snap Error',
      data: {
        cause: {
          code: 0,
          message: 'foo',
          stack: error.stack,
          data: {
            foo: 'bar',
            bar: 'qux',
          },
        },
      },
    });
  });

  it('serializes an error to JSON', () => {
    const error = new SnapError('foo');

    expect(error.serialize()).toStrictEqual(error.toJSON());
  });
});
