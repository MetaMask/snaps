import { errorCodes, rpcErrors } from '@metamask/rpc-errors';

import {
  getErrorCode,
  getErrorData,
  getErrorMessage,
  getErrorName,
  getErrorStack,
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

describe('getErrorStack', () => {
  it('returns the error stack if the error is an object with a stack property', () => {
    const error = new Error('foo');

    expect(getErrorStack(error)).toBe(error.stack);
    expect(getErrorStack({ stack: 'foo' })).toBe('foo');
    expect(getErrorStack(rpcErrors.invalidParams('foo'))).toBeDefined();
  });

  it('returns null if the error does not have a stack property', () => {
    expect(getErrorStack('foo')).toBeNull();
    expect(getErrorStack(123)).toBeNull();
    expect(getErrorStack(true)).toBeNull();
    expect(getErrorStack(null)).toBeNull();
    expect(getErrorStack(undefined)).toBeNull();
    expect(getErrorStack({ foo: 'bar' })).toBeNull();
  });
});

describe('getErrorName', () => {
  it('returns the error name if the error is an object with a name property', () => {
    expect(getErrorName(new Error('foo'))).toBe('Error');
    expect(getErrorName({ name: 'foo' })).toBe('foo');
    expect(getErrorName(rpcErrors.invalidParams('foo'))).toBe('Error');
    expect(getErrorName(new TypeError('foo'))).toBe('TypeError');
  });

  it('returns "Error" if the error does not have a name property', () => {
    expect(getErrorName('foo')).toBe('Error');
    expect(getErrorName(123)).toBe('Error');
    expect(getErrorName(true)).toBe('Error');
    expect(getErrorName(null)).toBe('Error');
    expect(getErrorName(undefined)).toBe('Error');
    expect(getErrorName({ foo: 'bar' })).toBe('Error');
  });
});

describe('getErrorCode', () => {
  it('returns the error code if the error is an object with a code property', () => {
    expect(getErrorCode({ code: 123 })).toBe(123);
    expect(getErrorCode(rpcErrors.invalidParams('foo'))).toBe(-32602);
  });

  it('returns `errorCodes.rpc.internal` if the error does not have a code property', () => {
    expect(getErrorCode('foo')).toBe(errorCodes.rpc.internal);
    expect(getErrorCode(123)).toBe(errorCodes.rpc.internal);
    expect(getErrorCode(true)).toBe(errorCodes.rpc.internal);
    expect(getErrorCode(null)).toBe(errorCodes.rpc.internal);
    expect(getErrorCode(undefined)).toBe(errorCodes.rpc.internal);
    expect(getErrorCode({ foo: 'bar' })).toBe(errorCodes.rpc.internal);
  });
});

describe('getErrorData', () => {
  it('returns the error data if the error is an object with a data property', () => {
    expect(getErrorData({ data: { foo: 'bar' } })).toStrictEqual({
      foo: 'bar',
    });

    expect(getErrorData(rpcErrors.invalidParams('foo'))).toStrictEqual({});
  });

  it('returns an empty object if the error does not have a data property', () => {
    expect(getErrorData('foo')).toStrictEqual({});
    expect(getErrorData(123)).toStrictEqual({});
    expect(getErrorData(true)).toStrictEqual({});
    expect(getErrorData(null)).toStrictEqual({});
    expect(getErrorData(undefined)).toStrictEqual({});
    expect(getErrorData({ foo: 'bar' })).toStrictEqual({});
  });
});
