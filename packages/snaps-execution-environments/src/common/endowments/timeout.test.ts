import timeout from './timeout';

describe('Timeout endowments', () => {
  it('has expected properties', () => {
    expect(timeout).toMatchObject({
      names: ['setTimeout', 'clearTimeout'],
      factory: expect.any(Function),
    });
  });

  it('has expected factory output', () => {
    expect(timeout.factory()).toMatchObject({
      setTimeout: expect.any(Function),
      clearTimeout: expect.any(Function),
    });
  });

  it('should be able to create and clear a timeout', async () => {
    const { setTimeout: _setTimeout, clearTimeout: _clearTimeout } =
      timeout.factory();

    expect(
      await new Promise((resolve, reject) => {
        const handle = _setTimeout(reject, 100);
        _clearTimeout(handle);
        _setTimeout(resolve, 200);
      }),
    ).toBeUndefined();
  }, 300);

  it('teardownFunction should clear timeouts', async () => {
    const { setTimeout: _setTimeout, teardownFunction } = timeout.factory();

    expect(
      await new Promise((resolve, reject) => {
        _setTimeout(reject, 100);
        teardownFunction();
        setTimeout(resolve, 200);
      }),
    ).toBeUndefined();
  }, 300);

  it('should not be able to clear a timeout created with the global setTimeout', async () => {
    const { clearTimeout: _clearTimeout } = timeout.factory();

    expect(
      await new Promise((resolve) => {
        const handle = setTimeout(resolve, 100);
        _clearTimeout(handle as any);
      }),
    ).toBeUndefined();
  }, 200);

  it('the attenuated setTimeout should throw if passed a non-function', () => {
    const { setTimeout: _setTimeout } = timeout.factory();

    [undefined, null, 'foo', {}, [], true].forEach((invalidInput) => {
      expect(() => _setTimeout(invalidInput as any)).toThrow(
        `The timeout handler must be a function. Received: ${typeof invalidInput}`,
      );
    });
  });
});
