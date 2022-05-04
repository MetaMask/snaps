import interval from './interval';

describe('Interval endowments', () => {
  it('has expected properties', () => {
    expect(interval).toMatchObject({
      names: ['setInterval', 'clearInterval'],
      factory: expect.any(Function),
    });
  });

  it('has expected factory output', () => {
    expect(interval.factory()).toMatchObject({
      setInterval: expect.any(Function),
      clearInterval: expect.any(Function),
    });
  });

  it('should be able to set and clear an interval', async () => {
    const { setInterval: _setInterval, clearInterval: _clearInterval } =
      interval.factory();

    expect(
      await new Promise((resolve, reject) => {
        const handle = _setInterval(reject, 100);
        _clearInterval(handle);
        _setInterval(resolve, 200);
      }),
    ).toBeUndefined();
  }, 300);

  it('teardownFunction should clear intervals', async () => {
    const { setInterval: _setInterval, teardownFunction } = interval.factory();

    expect(
      await new Promise((resolve, reject) => {
        _setInterval(reject, 100);
        teardownFunction();
        setInterval(resolve, 200);
      }),
    ).toBeUndefined();
  }, 300);

  it('should not be able to clear an interval created with the global setInterval', async () => {
    const { clearInterval: _clearInterval } = interval.factory();

    expect(
      await new Promise((resolve) => {
        const handle = setInterval(resolve, 100);
        _clearInterval(handle as any);
      }),
    ).toBeUndefined();
  }, 200);

  it('the attenuated setInterval should throw if passed a non-function', () => {
    const { setInterval: _setInterval } = interval.factory();

    [undefined, null, 'foo', {}, [], true].forEach((invalidInput) => {
      expect(() => _setInterval(invalidInput as any)).toThrow(
        `The interval handler must be a function. Received: ${typeof invalidInput}`,
      );
    });
  });
});
