import { logError, logInfo, logWarning } from './logging';

describe('logInfo', () => {
  it('logs the message', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation();

    logInfo('foo', 'bar', 'baz');
    expect(spy).toHaveBeenCalledWith('foo', 'bar', 'baz');
  });
});

describe('logError', () => {
  it('logs the error', () => {
    const error = new Error('foo');
    const spy = jest.spyOn(console, 'error').mockImplementation();

    logError(error, 'bar', 'baz');
    expect(spy).toHaveBeenCalledWith(error, 'bar', 'baz');
  });
});

describe('logWarning', () => {
  it('logs the warning', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation();

    logWarning('foo', 'bar', 'baz');
    expect(spy).toHaveBeenCalledWith('foo', 'bar', 'baz');
  });
});
