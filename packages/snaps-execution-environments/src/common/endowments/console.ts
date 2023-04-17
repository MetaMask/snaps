import { rootRealmGlobal } from '../globalObject';
import { EndowmentFactoryOptions } from './commonEndowmentFactory';

export const consoleAttenuatedMethods = new Set([
  'log',
  'assert',
  'error',
  'debug',
  'info',
  'warn',
]);

/**
 * Create a a {@link console} object, with the same properties as the global
 * {@link console} object, but with some methods replaced.
 *
 * @param options - Factory options used in construction of the endowment.
 * @param options.snapId - The id of the snap that will interact with the endowment.
 * @returns The {@link console} object with the replaced methods.
 */
function createConsole({ snapId }: EndowmentFactoryOptions = {}) {
  const keys = Object.getOwnPropertyNames(
    rootRealmGlobal.console,
  ) as (keyof typeof console)[];

  const attenuatedConsole = keys.reduce((target, key) => {
    if (consoleAttenuatedMethods.has(key)) {
      return target;
    }

    return { ...target, [key]: rootRealmGlobal.console[key] };
  }, {});

  return harden({
    console: {
      ...attenuatedConsole,
      log: (message?: any, ...optionalParams: any[]) => {
        rootRealmGlobal.console.log(`[SNAP LOG | snapId: ${snapId}]`);
        rootRealmGlobal.console.log(message, ...optionalParams);
      },
      assert: (
        value: any,
        message?: string | undefined,
        ...optionalParams: any[]
      ) => {
        rootRealmGlobal.console.log(`[SNAP ASSERT | snapId: ${snapId}]`);
        rootRealmGlobal.console.assert(value, message, ...optionalParams);
      },
      error: (message?: any, ...optionalParams: any[]) => {
        rootRealmGlobal.console.log(`[SNAP ERROR | snapId: ${snapId}]`);
        rootRealmGlobal.console.error(message, ...optionalParams);
      },
      debug: (message?: any, ...optionalParams: any[]) => {
        rootRealmGlobal.console.log(`[SNAP DEBUG | snapId: ${snapId}]`);
        rootRealmGlobal.console.debug(message, ...optionalParams);
      },
      info: (message?: any, ...optionalParams: any[]) => {
        rootRealmGlobal.console.log(`[SNAP INFO | snapId: ${snapId}]`);
        rootRealmGlobal.console.info(message, ...optionalParams);
      },
      warn: (message?: any, ...optionalParams: any[]) => {
        rootRealmGlobal.console.log(`[SNAP WARN | snapId: ${snapId}]`);
        rootRealmGlobal.console.warn(message, ...optionalParams);
      },
    },
  });
}

const endowmentModule = {
  names: ['console'] as const,
  factory: createConsole,
};

export default endowmentModule;
