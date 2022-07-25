import fetchMock from 'jest-fetch-mock';
import { createEndowments, isConstructor } from '.';

describe('Endowment utils', () => {
  describe('createEndowments', () => {
    beforeAll(() => {
      jest.useFakeTimers();
      fetchMock.enableMocks();
    });

    afterAll(() => {
      jest.useRealTimers();
      fetchMock.disableMocks();
    });

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
      const { endowments } = createEndowments(mockWallet as any, [
        'Math',
        'Date',
      ]);

      expect(endowments).toStrictEqual({
        wallet: mockWallet,
        Math,
        Date,
      });
      expect(endowments.Math).toBe(Math);
      expect(endowments.Date).toBe(Date);
    });

    it('handles special cases where endowment is a function but not a constructor', () => {
      const mockWallet = { foo: Symbol('bar') };
      const mockEndowment = () => {
        return {};
      };
      Object.assign(globalThis, { mockEndowment });
      const { endowments } = createEndowments(mockWallet as any, [
        'Math',
        'Date',
        'mockEndowment',
      ]);
      expect(endowments.Math).toBe(Math);
      expect(endowments.Date).toBe(Date);
      expect(endowments.mockEndowment).toBeDefined();
    });

    it('handles factory endowments', () => {
      const mockWallet = { foo: Symbol('bar') };
      const { endowments } = createEndowments(mockWallet as any, [
        'setTimeout',
      ]);

      expect(endowments).toStrictEqual({
        wallet: mockWallet,
        setTimeout: expect.any(Function),
      });
      expect(endowments.setTimeout).not.toBe(setTimeout);
    });

    it('handles some endowments from the same factory', () => {
      const mockWallet = { foo: Symbol('bar') };
      const { endowments } = createEndowments(mockWallet as any, [
        'setTimeout',
      ]);

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
        throw new Error('timeout was called');
      }, 1000);

      setInterval(() => {
        throw new Error('interval was called');
      }, 1000);

      teardown();
      jest.runAllTimers();

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

    it('teardown can be called multiple times', async () => {
      const { endowments, teardown } = createEndowments({} as any, [
        'setTimeout',
        'clearTimeout',
        'setInterval',
        'clearInterval',
      ]);

      const { setInterval, setTimeout } = endowments as {
        setInterval: typeof globalThis.setInterval;
        setTimeout: typeof globalThis.setTimeout;
      };

      const timeout = () =>
        setTimeout(() => {
          throw new Error('timeout was called');
        }, 1000);
      const interval = () =>
        setInterval(() => {
          throw new Error('interval was called');
        }, 1000);

      timeout();
      interval();
      teardown();
      jest.runAllTimers();

      timeout();
      interval();
      timeout();
      interval();
      teardown();
      jest.runAllTimers();

      teardown();
      jest.runAllTimers();

      let resolve: (result: unknown) => void;
      const promise = new Promise((r) => (resolve = r));
      setTimeout(() => resolve('OK'), 1000);
      jest.runAllTimers();

      expect(await promise).toStrictEqual('OK');
      teardown();
      jest.runAllTimers();
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
