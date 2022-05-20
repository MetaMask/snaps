import { createEndowments, isConstructor } from '.';

describe('Endowment utils', () => {
  describe('createEndowments', () => {
    it('handles no endowments', () => {
      const mockWallet = { foo: Symbol('bar') };
      expect(createEndowments(mockWallet as any)).toStrictEqual({
        endowments: {
          wallet: mockWallet,
        },
        teardown: expect.any(Function),
      });
    });

    it('handles unattenuated endowments', () => {
      const mockWallet = { foo: Symbol('bar') };
      const endowments = createEndowments(mockWallet as any, ['Math', 'Date']);

      expect(endowments).toStrictEqual({
        endowments: {
          wallet: mockWallet,
          Math,
          Date,
        },
        teardown: expect.any(Function),
      });
      expect(endowments.endowments.Math).toBe(Math);
      expect(endowments.endowments.Date).toBe(Date);
    });

    it('handles special cases where endowment is a function but not a constructor', () => {
      const mockWallet = { foo: Symbol('bar') };
      const mockEndowment = () => {
        return {};
      };
      Object.assign(globalThis, { mockEndowment });
      const endowments = createEndowments(mockWallet as any, [
        'Math',
        'Date',
        'mockEndowment',
      ]);
      expect(endowments.endowments.Math).toBe(Math);
      expect(endowments.endowments.Date).toBe(Date);
      expect(endowments.endowments.mockEndowment).toBeDefined();
    });

    it('handles factory endowments', () => {
      const mockWallet = { foo: Symbol('bar') };
      const endowments = createEndowments(mockWallet as any, ['WebAssembly']);

      expect(endowments).toStrictEqual({
        endowments: {
          wallet: mockWallet,
          WebAssembly: expect.objectContaining(WebAssembly),
        },
        teardown: expect.any(Function),
      });
    });

    it('handles some endowments from the same factory', () => {
      const mockWallet = { foo: Symbol('bar') };
      const endowments = createEndowments(mockWallet as any, ['setTimeout']);

      expect(endowments).toMatchObject({
        endowments: {
          wallet: mockWallet,
          setTimeout: expect.any(Function),
        },
        teardown: expect.any(Function),
      });
      expect(endowments.endowments.setTimeout).not.toBe(setTimeout);
    });

    it('handles all endowments from the same factory', () => {
      const mockWallet = { foo: Symbol('bar') };
      const endowments = createEndowments(mockWallet as any, [
        'setTimeout',
        'clearTimeout',
      ]);

      expect(endowments).toMatchObject({
        endowments: {
          wallet: mockWallet,
          setTimeout: expect.any(Function),
          clearTimeout: expect.any(Function),
        },
        teardown: expect.any(Function),
      });
      expect(endowments.endowments.clearTimeout).not.toBe(clearTimeout);
    });

    it('handles multiple endowments, factory and non-factory', () => {
      const mockWallet = { foo: Symbol('bar') };
      const endowments = createEndowments(mockWallet as any, [
        'Buffer',
        'console',
        'Math',
        'setTimeout',
        'clearTimeout',
        'WebAssembly',
      ]);

      expect(endowments).toMatchObject({
        endowments: {
          wallet: mockWallet,
          Buffer,
          console,
          Math,
          setTimeout: expect.any(Function),
          clearTimeout: expect.any(Function),
          WebAssembly: { ...WebAssembly },
        },
        teardown: expect.any(Function),
      });

      expect(endowments.endowments.wallet).toBe(mockWallet);
      expect(endowments.endowments.Buffer).toBe(Buffer);
      expect(endowments.endowments.Math).toBe(Math);
      expect(endowments.endowments.console).toBe(console);

      expect(endowments.endowments.clearTimeout).not.toBe(clearTimeout);
      expect(endowments.endowments.setTimeout).not.toBe(setTimeout);
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

  describe('isConstructor', () => {
    it("will return false if passed in a function who's prototype doesn't have a constructor", () => {
      const mockFn = jest.fn();
      mockFn.prototype = null;
      expect(isConstructor(mockFn)).toBe(false);
    });
  });
});
