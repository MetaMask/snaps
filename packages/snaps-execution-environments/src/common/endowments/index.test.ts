import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';
import fetchMock from 'jest-fetch-mock';

import { createEndowments } from '.';

const mockSnapAPI = { foo: Symbol('bar') };
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
        mockSnapAPI as any,
        mockEthereum as any,
        MOCK_SNAP_ID,
      );

      expect(
        createEndowments(mockSnapAPI as any, mockEthereum as any, MOCK_SNAP_ID),
      ).toStrictEqual({
        endowments: {
          snap: mockSnapAPI,
        },
        teardown: expect.any(Function),
      });
      expect(endowments.snap).toBe(mockSnapAPI);
    });

    it('handles special cases where endowment is not available as part of a factory', () => {
      const mockEndowment = {};
      Object.assign(globalThis, { mockEndowment });
      const { endowments } = createEndowments(
        mockSnapAPI as any,
        mockEthereum as any,
        MOCK_SNAP_ID,
        ['mockEndowment'],
      );
      expect(endowments.mockEndowment).toBeDefined();
    });

    it('handles special case for ethereum endowment', () => {
      Object.assign(globalThis, { ethereum: {} });
      const { endowments } = createEndowments(
        mockSnapAPI as any,
        mockEthereum as any,
        MOCK_SNAP_ID,
        ['ethereum'],
      );
      expect(endowments.ethereum).toBe(mockEthereum);
    });

    it('handles factory endowments', () => {
      const { endowments } = createEndowments(
        mockSnapAPI as any,
        mockEthereum as any,
        MOCK_SNAP_ID,
        ['setTimeout'],
      );

      expect(endowments).toStrictEqual({
        snap: mockSnapAPI,
        setTimeout: expect.any(Function),
      });
      expect(endowments.setTimeout).not.toBe(setTimeout);
    });

    it('handles some endowments from the same factory', () => {
      const { endowments } = createEndowments(
        mockSnapAPI as any,
        mockEthereum as any,
        MOCK_SNAP_ID,
        ['setTimeout'],
      );

      expect(endowments).toMatchObject({
        snap: mockSnapAPI,
        setTimeout: expect.any(Function),
      });
      expect(endowments.setTimeout).not.toBe(setTimeout);
    });

    it('handles all endowments from the same factory', () => {
      const { endowments } = createEndowments(
        mockSnapAPI as any,
        mockEthereum as any,
        MOCK_SNAP_ID,
        ['setTimeout', 'clearTimeout'],
      );

      expect(endowments).toMatchObject({
        snap: mockSnapAPI,
        setTimeout: expect.any(Function),
        clearTimeout: expect.any(Function),
      });
      expect(endowments.clearTimeout).not.toBe(clearTimeout);
    });

    it('handles multiple endowments, factory and non-factory', () => {
      const { endowments } = createEndowments(
        mockSnapAPI as any,
        mockEthereum as any,
        MOCK_SNAP_ID,
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
        createEndowments(
          mockSnapAPI as any,
          mockEthereum as any,
          MOCK_SNAP_ID,
          ['foo'],
        ),
      ).toThrow('Unknown endowment: "foo"');
    });

    it('teardown calls all teardown functions', async () => {
      const { endowments, teardown } = createEndowments(
        mockSnapAPI as any,
        mockEthereum as any,
        MOCK_SNAP_ID,
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
      const { endowments, teardown } = createEndowments(
        mockSnapAPI as any,
        mockEthereum as any,
        MOCK_SNAP_ID,
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
