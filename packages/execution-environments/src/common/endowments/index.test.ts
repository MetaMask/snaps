import { createEndowments } from '.';

describe('createEndowments', () => {
  it('handles no endowments', () => {
    const mockWallet = { foo: Symbol('bar') };
    const { endowments } = createEndowments(mockWallet as any);

    expect(createEndowments(mockWallet as any, [])).toStrictEqual({
      endowments: {
        wallet: mockWallet,
      },
      teardown: expect.any(Function),
    });
    expect(endowments.wallet).toBe(mockWallet);
  });

  it('handles unattenuated endowments', () => {
    const mockWallet = { foo: Symbol('bar') };
    const { endowments } = createEndowments(mockWallet as any, ['Math']);

    expect(endowments).toStrictEqual({
      wallet: mockWallet,
      Math,
    });
    expect(endowments.Math).toBe(Math);
  });

  it('handles factory endowments', () => {
    const mockWallet = { foo: Symbol('bar') };
    const { endowments } = createEndowments(mockWallet as any, ['setTimeout']);

    expect(endowments).toStrictEqual({
      wallet: mockWallet,
      setTimeout: expect.any(Function),
    });
    expect(endowments.setTimeout).not.toBe(setTimeout);
  });

  it('handles some endowments from the same factory', () => {
    const mockWallet = { foo: Symbol('bar') };
    const { endowments } = createEndowments(mockWallet as any, ['setTimeout']);

    expect(endowments).toMatchObject({
      wallet: mockWallet,
      setTimeout: expect.any(Function),
    });
    expect(endowments.setTimeout).not.toBe(setTimeout);
  });

  it('handles all endowments from the same factory', () => {
    const mockWallet = { foo: Symbol('bar') };
    const { endowments } = createEndowments(mockWallet as any, [
      'setTimeout',
      'clearTimeout',
    ]);

    expect(endowments).toMatchObject({
      wallet: mockWallet,
      setTimeout: expect.any(Function),
      clearTimeout: expect.any(Function),
    });
    expect(endowments.clearTimeout).not.toBe(clearTimeout);
  });

  it('handles multiple endowments, factory and non-factory', () => {
    const mockWallet = { foo: Symbol('bar') };
    const { endowments } = createEndowments(mockWallet as any, [
      'Buffer',
      'console',
      'Math',
      'setTimeout',
      'clearTimeout',
      'WebAssembly',
    ]);

    expect(endowments).toMatchObject({
      wallet: mockWallet,
      Buffer,
      console,
      Math,
      setTimeout: expect.any(Function),
      clearTimeout: expect.any(Function),
      WebAssembly,
    });

    expect(endowments.wallet).toBe(mockWallet);
    expect(endowments.Buffer).toBe(Buffer);
    expect(endowments.console).toBe(console);
    expect(endowments.Math).toBe(Math);
    expect(endowments.WebAssembly).toBe(WebAssembly);

    expect(endowments.clearTimeout).not.toBe(clearTimeout);
    expect(endowments.setTimeout).not.toBe(setTimeout);
  });

  it('throws for unknown endowments', () => {
    const mockWallet = { foo: Symbol('bar') };
    expect(() => createEndowments(mockWallet as any, ['foo'])).toThrow(
      'Unknown endowment: "foo"',
    );
  });

  it('teardown calls all teardown functions', () => {
    const mockWallet = { foo: Symbol('bar') };
    const { endowments, teardown } = createEndowments(mockWallet as any, [
      'setTimeout',
      'clearTimeout',
      'setInterval',
      'clearInterval',
    ]);

    const clearTimeoutSpy = jest.spyOn(globalThis, 'clearTimeout');
    const clearIntervalSpy = jest.spyOn(globalThis, 'clearInterval');

    const { setInterval, setTimeout } = endowments as {
      setInterval: typeof globalThis.setInterval;
      setTimeout: typeof globalThis.setTimeout;
    };
    setTimeout(() => {
      // no-op
    }, 1000);

    setInterval(() => {
      // no-op
    }, 1000);

    teardown();

    expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
    expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
    expect(endowments).toMatchObject({
      wallet: mockWallet,
      setTimeout: expect.any(Function),
      clearTimeout: expect.any(Function),
      setInterval: expect.any(Function),
      clearInterval: expect.any(Function),
    });
  });
});
