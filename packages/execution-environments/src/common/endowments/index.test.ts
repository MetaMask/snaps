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
    const { endowments } = createEndowments(mockWallet as any, ['WebAssembly']);

    expect(endowments).toStrictEqual({
      wallet: mockWallet,
      WebAssembly: expect.objectContaining(WebAssembly),
    });
    expect(endowments.WebAssembly).not.toBe(WebAssembly);
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
      WebAssembly: { ...WebAssembly },
    });

    expect(endowments.wallet).toBe(mockWallet);
    expect(endowments.Buffer).toBe(Buffer);
    expect(endowments.Math).toBe(Math);
    expect(endowments.console).toBe(console);

    expect(endowments.clearTimeout).not.toBe(clearTimeout);
    expect(endowments.setTimeout).not.toBe(setTimeout);
    expect(endowments.WebAssembly).not.toBe(WebAssembly);
  });

  it('throws for unknown endowments', () => {
    const mockWallet = { foo: Symbol('bar') };
    expect(() => createEndowments(mockWallet as any, ['foo'])).toThrow(
      'Unknown endowment: "foo"',
    );
  });
});
