import { ethErrors } from 'eth-rpc-errors';

import { getErrorMessage } from './errors';

describe('getErrorMessage', () => {
  it('returns the error message if the error is an object with a message property', () => {
    expect(getErrorMessage(new Error('foo'))).toBe('foo');
    expect(getErrorMessage({ message: 'foo' })).toBe('foo');
    expect(getErrorMessage(ethErrors.rpc.invalidParams('foo'))).toBe('foo');
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
