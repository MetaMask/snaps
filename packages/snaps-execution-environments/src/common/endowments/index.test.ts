import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';
import fetchMock from 'jest-fetch-mock';

import { createEndowments } from '.';

const mockSnapAPI = { foo: Symbol('bar') };
const mockEthereum = { foo: Symbol('bar') };

const mockOptions = {
  snap: mockSnapAPI as any,
  ethereum: mockEthereum as any,
  snapId: MOCK_SNAP_ID,
  notify: jest.fn(),
  endowments: [],
};

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
      const result = createEndowments(mockOptions);

      expect(result).toStrictEqual({
        endowments: {
          snap: mockSnapAPI,
        },
        teardown: expect.any(Function),
      });
      expect(result.endowments.snap).toBe(mockSnapAPI);
    });

    it('handles special cases where endowment is not available as part of a factory', () => {
      const mockEndowment = {};
      Object.assign(globalThis, { mockEndowment });
      const { endowments } = createEndowments({
        ...mockOptions,
        endowments: ['mockEndowment'],
      });
      expect(endowments.mockEndowment).toBeDefined();
    });

    it('handles special case for ethereum endowment', () => {
      Object.assign(globalThis, { ethereum: {} });
      const { endowments } = createEndowments({
        ...mockOptions,
        endowments: ['ethereum'],
      });
      expect(endowments.ethereum).toBe(mockEthereum);
    });

    it('handles factory endowments', () => {
      const { endowments } = createEndowments({
        ...mockOptions,
        endowments: ['setTimeout'],
      });

      expect(endowments).toStrictEqual({
        snap: mockSnapAPI,
        setTimeout: expect.any(Function),
      });
      expect(endowments.setTimeout).not.toBe(setTimeout);
    });

    it('handles some endowments from the same factory', () => {
      const { endowments } = createEndowments({
        ...mockOptions,
        endowments: ['setTimeout'],
      });

      expect(endowments).toMatchObject({
        snap: mockSnapAPI,
        setTimeout: expect.any(Function),
      });
      expect(endowments.setTimeout).not.toBe(setTimeout);
    });

    it('handles all endowments from the same factory', () => {
      const { endowments } = createEndowments({
        ...mockOptions,
        endowments: ['setTimeout', 'clearTimeout'],
      });

      expect(endowments).toMatchObject({
        snap: mockSnapAPI,
        setTimeout: expect.any(Function),
        clearTimeout: expect.any(Function),
      });
      expect(endowments.clearTimeout).not.toBe(clearTimeout);
    });

    it('handles multiple endowments, factory and non-factory', () => {
      const { endowments } = createEndowments({
        ...mockOptions,
        endowments: [
          'console',
          'Uint8Array',
          'Math',
          'setTimeout',
          'clearTimeout',
          'WebAssembly',
        ],
      });

      expect(endowments).toMatchObject({
        snap: mockSnapAPI,
        console: expect.any(Object),
        Uint8Array: expect.any(Function),
        Math: expect.any(Object),
        setTimeout: expect.any(Function),
        clearTimeout: expect.any(Function),
        WebAssembly: expect.any(Object),
      });

      expect(endowments.snap).toBe(mockSnapAPI);
      expect(endowments.Uint8Array).toBe(Uint8Array);
      expect(endowments.WebAssembly).toBe(WebAssembly);

      expect(endowments.clearTimeout).not.toBe(clearTimeout);
      expect(endowments.setTimeout).not.toBe(setTimeout);
      expect(endowments.Math).not.toBe(Math);
      expect(endowments.console).not.toBe(console);
    });

    it('throws for unknown endowments', () => {
      expect(() =>
        createEndowments({
          ...mockOptions,
          endowments: ['foo'],
        }),
      ).toThrow('Unknown endowment: "foo"');
    });

    it('teardown calls all teardown functions', async () => {
      const { endowments, teardown } = createEndowments({
        ...mockOptions,
        endowments: [
          'setTimeout',
          'clearTimeout',
          'setInterval',
          'clearInterval',
        ],
      });

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

      await teardown();
      jest.runAllTimers();

      expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
      expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
      expect(endowments).toMatchObject({
        snap: mockSnapAPI,
        setTimeout: expect.any(Function),
        clearTimeout: expect.any(Function),
        setInterval: expect.any(Function),
        clearInterval: expect.any(Function),
      });
    });

    it('teardown can be called multiple times', async () => {
      const { endowments, teardown } = createEndowments({
        ...mockOptions,
        endowments: [
          'setTimeout',
          'clearTimeout',
          'setInterval',
          'clearInterval',
        ],
      });

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
      await teardown();
      jest.runAllTimers();

      timeout();
      interval();
      timeout();
      interval();
      await teardown();
      jest.runAllTimers();

      await teardown();
      jest.runAllTimers();

      let resolve: (result: unknown) => void;
      const promise = new Promise((_resolve) => (resolve = _resolve));
      setTimeout(() => resolve('OK'), 1000);
      jest.runAllTimers();

      expect(await promise).toBe('OK');
      await teardown();
      jest.runAllTimers();
    });
  });
});
