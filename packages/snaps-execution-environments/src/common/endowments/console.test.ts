import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';

import { rootRealmGlobal } from '../globalObject';
import consoleEndowment, { consoleAttenuatedMethods } from './console';

describe('Console endowment', () => {
  it('has expected properties', () => {
    expect(consoleEndowment).toMatchObject({
      names: ['console'],
      factory: expect.any(Function),
    });
  });

  it('returns console properties from rootRealmGlobal', () => {
    const { console }: { console: Partial<typeof rootRealmGlobal.console> } =
      consoleEndowment.factory({ snapId: MOCK_SNAP_ID });
    const consoleProperties = Object.getOwnPropertyNames(
      rootRealmGlobal.console,
    );
    const unchangedProperties = consoleProperties.filter(
      (property) => !consoleAttenuatedMethods.has(property),
    ) as (keyof typeof rootRealmGlobal.console)[];
    unchangedProperties.forEach((unchangedProperty) => {
      expect(console[unchangedProperty]).toStrictEqual(
        rootRealmGlobal.console[unchangedProperty],
      );
    });
  });

  describe('log', () => {
    it('does not return the original console.log', () => {
      const { console } = consoleEndowment.factory({ snapId: MOCK_SNAP_ID });
      expect(console.log).not.toStrictEqual(rootRealmGlobal.console.log);
    });

    it('will log a message identifying the source of the call (snap id)', () => {
      const { console } = consoleEndowment.factory({ snapId: MOCK_SNAP_ID });
      const logSpy = jest.spyOn(rootRealmGlobal.console, 'log');
      console.log('This is a log message.');
      expect(logSpy).toHaveBeenNthCalledWith(
        1,
        `[SNAP LOG | snapId: ${MOCK_SNAP_ID}]`,
      );
      expect(logSpy).toHaveBeenNthCalledWith(2, 'This is a log message.');
    });
  });

  describe('error', () => {
    it('does not return the original console.error', () => {
      const { console } = consoleEndowment.factory({ snapId: MOCK_SNAP_ID });
      expect(console.error).not.toStrictEqual(rootRealmGlobal.console.error);
    });

    it('will log a message identifying the source of the call (snap id)', () => {
      const { console } = consoleEndowment.factory({ snapId: MOCK_SNAP_ID });
      const logSpy = jest.spyOn(rootRealmGlobal.console, 'log');
      const errorSpy = jest.spyOn(rootRealmGlobal.console, 'error');
      console.error('This is an error message.');
      expect(logSpy).toHaveBeenCalledWith(
        `[SNAP ERROR | snapId: ${MOCK_SNAP_ID}]`,
      );
      expect(errorSpy).toHaveBeenCalledWith('This is an error message.');
    });
  });

  describe('assert', () => {
    it('does not return the original console.assert', () => {
      const { console } = consoleEndowment.factory({ snapId: MOCK_SNAP_ID });
      expect(console.assert).not.toStrictEqual(rootRealmGlobal.console.assert);
    });

    it('will log a message identifying the source of the call (snap id)', () => {
      const { console } = consoleEndowment.factory({ snapId: MOCK_SNAP_ID });
      const logSpy = jest.spyOn(rootRealmGlobal.console, 'log');
      const assertSpy = jest.spyOn(rootRealmGlobal.console, 'assert');
      console.assert(1 > 2, 'This is an assert message.');
      expect(logSpy).toHaveBeenCalledWith(
        `[SNAP ASSERT | snapId: ${MOCK_SNAP_ID}]`,
      );
      expect(assertSpy).toHaveBeenCalledWith(
        1 > 2,
        'This is an assert message.',
      );
    });
  });

  describe('debug', () => {
    it('does not return the original console.debug', () => {
      const { console } = consoleEndowment.factory({ snapId: MOCK_SNAP_ID });
      expect(console.debug).not.toStrictEqual(rootRealmGlobal.console.debug);
    });

    it('will log a message identifying the source of the call (snap id)', () => {
      const { console } = consoleEndowment.factory({ snapId: MOCK_SNAP_ID });
      const logSpy = jest.spyOn(rootRealmGlobal.console, 'log');
      const debugSpy = jest.spyOn(rootRealmGlobal.console, 'debug');
      console.debug('This is a debug message.');
      expect(logSpy).toHaveBeenCalledWith(
        `[SNAP DEBUG | snapId: ${MOCK_SNAP_ID}]`,
      );
      expect(debugSpy).toHaveBeenCalledWith('This is a debug message.');
    });
  });

  describe('info', () => {
    it('does not return the original console.info', () => {
      const { console } = consoleEndowment.factory({ snapId: MOCK_SNAP_ID });
      expect(console.info).not.toStrictEqual(rootRealmGlobal.console.info);
    });

    it('will log a message identifying the source of the call (snap id)', () => {
      const { console } = consoleEndowment.factory({ snapId: MOCK_SNAP_ID });
      const infoSpy = jest.spyOn(rootRealmGlobal.console, 'info');
      const logSpy = jest.spyOn(rootRealmGlobal.console, 'log');
      console.info('This is an info message.');
      expect(logSpy).toHaveBeenCalledWith(
        `[SNAP INFO | snapId: ${MOCK_SNAP_ID}]`,
      );
      expect(infoSpy).toHaveBeenCalledWith('This is an info message.');
    });
  });

  describe('warn', () => {
    it('does not return the original console.warn', () => {
      const { console } = consoleEndowment.factory({ snapId: MOCK_SNAP_ID });
      expect(console.warn).not.toStrictEqual(rootRealmGlobal.console.warn);
    });

    it('will log a message identifying the source of the call (snap id)', () => {
      const { console } = consoleEndowment.factory({ snapId: MOCK_SNAP_ID });
      const logSpy = jest.spyOn(rootRealmGlobal.console, 'log');
      const warnSpy = jest.spyOn(rootRealmGlobal.console, 'warn');
      console.warn('This is a warn message.');
      expect(logSpy).toHaveBeenCalledWith(
        `[SNAP WARN | snapId: ${MOCK_SNAP_ID}]`,
      );
      expect(warnSpy).toHaveBeenCalledWith('This is a warn message.');
    });
  });
});
