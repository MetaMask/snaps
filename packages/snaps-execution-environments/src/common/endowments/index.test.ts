import fetchMock from 'jest-fetch-mock';
import { createEndowments, isConstructor } from '.';

const mockSnapsAPI = { foo: Symbol('bar') };
const mockEthereum = { foo: Symbol('bar') };

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
      const { endowments } = createEndowments(
        mockSnapsAPI as any,
        mockEthereum as any,
      );

      expect(
        createEndowments(mockSnapsAPI as any, mockEthereum as any),
      ).toStrictEqual({
        endowments: {
          snaps: mockSnapsAPI,
        },
        teardown: expect.any(Function),
      });
      expect(endowments.snaps).toBe(mockSnapsAPI);
    });

    it('handles unattenuated endowments', () => {
      const { endowments } = createEndowments(
        mockSnapsAPI as any,
        mockEthereum as any,
        ['Uint8Array', 'Date'],
      );

      expect(endowments).toStrictEqual({
        snaps: mockSnapsAPI,
        Uint8Array,
        Date,
      });
      expect(endowments.Uint8Array).toBe(Uint8Array);
      expect(endowments.Date).toBe(Date);
    });

    it('handles special cases where endowment is a function but not a constructor', () => {
      const mockEndowment = () => {
        return {};
      };
      Object.assign(globalThis, { mockEndowment });
      const { endowments } = createEndowments(
        mockSnapsAPI as any,
        mockEthereum as any,
        ['Date', 'mockEndowment'],
      );
      expect(endowments.Date).toBe(Date);
      expect(endowments.mockEndowment).toBeDefined();
    });

    it('handles factory endowments', () => {
      const { endowments } = createEndowments(
        mockSnapsAPI as any,
        mockEthereum as any,
        ['setTimeout'],
      );

      expect(endowments).toStrictEqual({
        snaps: mockSnapsAPI,
        setTimeout: expect.any(Function),
      });
      expect(endowments.setTimeout).not.toBe(setTimeout);
    });

    it('handles some endowments from the same factory', () => {
      const { endowments } = createEndowments(
        mockSnapsAPI as any,
        mockEthereum as any,
        ['setTimeout'],
      );

      expect(endowments).toMatchObject({
        snaps: mockSnapsAPI,
        setTimeout: expect.any(Function),
      });
      expect(endowments.setTimeout).not.toBe(setTimeout);
    });

    it('handles all endowments from the same factory', () => {
      const { endowments } = createEndowments(
        mockSnapsAPI as any,
        mockEthereum as any,
        ['setTimeout', 'clearTimeout'],
      );

      expect(endowments).toMatchObject({
        snaps: mockSnapsAPI,
        setTimeout: expect.any(Function),
        clearTimeout: expect.any(Function),
      });
      expect(endowments.clearTimeout).not.toBe(clearTimeout);
    });

    it('handles multiple endowments, factory and non-factory', () => {
      const { endowments } = createEndowments(
        mockSnapsAPI as any,
        mockEthereum as any,
        [
          'console',
          'Uint8Array',
          'Math',
          'setTimeout',
          'clearTimeout',
          'WebAssembly',
        ],
      );

      expect(endowments).toMatchObject({
        snaps: mockSnapsAPI,
        console,
        Uint8Array,
        Math: expect.any(Object),
        setTimeout: expect.any(Function),
        clearTimeout: expect.any(Function),
        WebAssembly,
      });

      expect(endowments.snaps).toBe(mockSnapsAPI);
      expect(endowments.console).toBe(console);
      expect(endowments.Uint8Array).toBe(Uint8Array);
      expect(endowments.WebAssembly).toBe(WebAssembly);

      expect(endowments.clearTimeout).not.toBe(clearTimeout);
      expect(endowments.setTimeout).not.toBe(setTimeout);
      expect(endowments.Math).not.toBe(Math);
    });

    it('throws for unknown endowments', () => {
      expect(() =>
        createEndowments(mockSnapsAPI as any, mockEthereum as any, ['foo']),
      ).toThrow('Unknown endowment: "foo"');
    });

    it('teardown calls all teardown functions', () => {
      const { endowments, teardown } = createEndowments(
        mockSnapsAPI as any,
        mockEthereum as any,
        ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'],
      );

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
        snaps: mockSnapsAPI,
        setTimeout: expect.any(Function),
        clearTimeout: expect.any(Function),
        setInterval: expect.any(Function),
        clearInterval: expect.any(Function),
      });
    });

    it('teardown can be called multiple times', async () => {
      const { endowments, teardown } = createEndowments(
        mockSnapsAPI as any,
        mockEthereum as any,
        ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'],
      );

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
