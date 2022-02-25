import { createTimeout } from './timeout';

describe('createTimeout', () => {
  it('should be able to create and clear a timeout', async () => {
    const { setTimeout: _setTimeout, clearTimeout: _clearTimeout } =
      createTimeout();

    expect(
      await new Promise((resolve, reject) => {
        const handle = _setTimeout(reject, 100);
        _clearTimeout(handle);
        _setTimeout(resolve, 200);
      }),
    ).toBeUndefined();
  }, 300);

  it('should not be able to clear a timeout created with the global setTimeout', async () => {
    const { clearTimeout: _clearTimeout } = createTimeout();

    expect(
      await new Promise((resolve) => {
        const handle = setTimeout(resolve, 100);
        _clearTimeout(handle as any);
      }),
    ).toBeUndefined();
  }, 200);

  it('the attenuated setTimeout should throw if passed a non-function', () => {
    const { setTimeout: _setTimeout } = createTimeout();

    [undefined, null, 'foo', {}, [], true].forEach((invalidInput) => {
      expect(() => _setTimeout(invalidInput as any)).toThrow(
        `The timeout handler must be a function. Received: ${typeof invalidInput}`,
      );
    });
  });
});
