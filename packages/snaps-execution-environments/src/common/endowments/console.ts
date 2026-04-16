import { assert } from '@metamask/utils';

import type { EndowmentFactoryOptions } from './commonEndowmentFactory';
import { rootRealmGlobal } from '../globalObject';

export const consoleAttenuatedMethods = new Set([
  'log',
  'assert',
  'error',
  'debug',
  'info',
  'warn',
]);

/**
 * A set of all the `console` method names that will be included in the
 * attenuated console object. Covers values available in both browser and
 * Node.js.
 */
export const consoleMethods = new Set([
  'debug',
  'error',
  'info',
  'log',
  'warn',
  'dir',
  'dirxml',
  'table',
  'trace',
  'group',
  'groupCollapsed',
  'groupEnd',
  'clear',
  'count',
  'countReset',
  'assert',
  'profile',
  'profileEnd',
  'time',
  'timeLog',
  'timeEnd',
  'timeStamp',
  'context',
]);

const consoleFunctions = ['log', 'error', 'debug', 'info', 'warn'] as const;

type ConsoleFunctions = {
  [Key in (typeof consoleFunctions)[number]]: (typeof rootRealmGlobal.console)[Key];
};

/**
 * Gets the appropriate (prepended) message to pass to one of the attenuated
 * method calls.
 *
 * @param sourceLabel - Label identifying the source of the console call.
 * @param message - The first argument passed to the console method.
 * @param args - The array of additional arguments.
 * @returns An array of arguments to be passed into an attenuated console method call.
 */
function getMessage(sourceLabel: string, message: unknown, ...args: unknown[]) {
  const prefix = `[${sourceLabel}]`;

  // If the first argument is a string, prepend the prefix to the message, and keep the
  // rest of the arguments as-is.
  if (typeof message === 'string') {
    return [`${prefix} ${message}`, ...args];
  }

  // Otherwise, the `message` is an object, array, etc., so add the prefix as a separate
  // message to the arguments.
  return [prefix, message, ...args];
}

/**
 * Create a {@link console} object, with the same properties as the global
 * {@link console} object, but with some methods replaced.
 *
 * @param options - Factory options used in construction of the endowment.
 * @param options.sourceLabel - Label identifying the source of the console call.
 * @returns The {@link console} object with the replaced methods.
 */
function createConsole({ sourceLabel }: EndowmentFactoryOptions = {}) {
  assert(
    sourceLabel !== undefined,
    'The "sourceLabel" option is required by the console endowment factory.',
  );
  const keys = Object.getOwnPropertyNames(
    rootRealmGlobal.console,
  ) as (keyof typeof console)[];

  const attenuatedConsole = keys.reduce((target, key) => {
    if (consoleMethods.has(key) && !consoleAttenuatedMethods.has(key)) {
      return { ...target, [key]: rootRealmGlobal.console[key] };
    }

    return target;
  }, {});

  return harden({
    console: {
      ...attenuatedConsole,
      assert: (
        value: any,
        message?: string | undefined,
        ...optionalParams: any[]
      ) => {
        rootRealmGlobal.console.assert(
          value,
          ...getMessage(sourceLabel, message, ...optionalParams),
        );
      },
      ...consoleFunctions.reduce<ConsoleFunctions>((target, key) => {
        return {
          ...target,
          [key]: (message?: unknown, ...optionalParams: any[]) => {
            rootRealmGlobal.console[key](
              ...getMessage(sourceLabel, message, ...optionalParams),
            );
          },
        };
      }, {} as ConsoleFunctions),
    },
  });
}

const endowmentModule = {
  names: ['console'] as const,
  factory: createConsole,
};

export default endowmentModule;
