import { getErrorMessage } from './errors';

describe('getErrorMessage', () => {
  it('returns the stack trace if it exists', () => {
    const error = new Error('foo');
    error.stack = 'bar';

    expect(getErrorMessage(error)).toBe('bar');
  });

  it('returns the message if the stack trace does not exist', () => {
    const error = new Error('foo');
    delete error.stack;

    expect(getErrorMessage(error)).toBe('foo');
  });

  it('returns the stringified error if it is not an instance of Error', () => {
    expect(getErrorMessage('foo')).toBe('foo');
  });
});
