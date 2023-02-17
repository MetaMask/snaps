import { StreamProvider } from '@metamask/providers';
import { SnapsGlobalObject } from '@metamask/rpc-methods';
import { hasProperty } from '@metamask/utils';

import { rootRealmGlobal } from '../globalObject';
import buildCommonEndowments from './commonEndowmentFactory';

type EndowmentFactoryResult = {
  /**
   * A function that performs any necessary teardown when the snap becomes idle.
   *
   * NOTE:** The endowments are not reconstructed if the snap is re-invoked
   * before being terminated, so the teardown operation must not render the
   * endowments unusable; it should simply restore the endowments to their
   * original state.
   */
  teardownFunction?: () => Promise<void> | void;
  [key: string]: unknown;
};

/**
 * Retrieve consolidated endowment factories for common endowments.
 */
const registeredEndowments = buildCommonEndowments();

/**
 * A map of endowment names to their factory functions. Some endowments share
 * the same factory function, but we only call each factory once for each snap.
 * See {@link createEndowments} for details.
 */
const endowmentFactories = registeredEndowments.reduce((factories, builder) => {
  builder.names.forEach((name) => {
    factories.set(name, builder.factory);
  });
  return factories;
}, new Map<string, () => EndowmentFactoryResult>());

/**
 * Gets the endowments for a particular Snap. Some endowments, like `setTimeout`
 * and `clearTimeout`, must be attenuated so that they can only affect behavior
 * within the Snap's own realm. Therefore, we use factory functions to create
 * such attenuated / modified endowments. Otherwise, the value that's on the
 * root realm global will be used.
 *
 * @param snap - The Snaps global API object.
 * @param ethereum - The Snap's EIP-1193 provider object.
 * @param endowments - The list of endowments to provide to the snap.
 * @returns An object containing the Snap's endowments.
 */
export function createEndowments(
  snap: SnapsGlobalObject,
  ethereum: StreamProvider,
  endowments: string[] = [],
): { endowments: Record<string, unknown>; teardown: () => Promise<void> } {
  const attenuatedEndowments: Record<string, unknown> = {};

  // TODO: All endowments should be hardened to prevent covert communication
  // channels. Hardening the returned objects breaks tests elsewhere in the
  // monorepo, so further research is needed.
  const result = endowments.reduce<{
    allEndowments: Record<string, unknown>;
    teardowns: (() => Promise<void> | void)[];
  }>(
    ({ allEndowments, teardowns }, endowmentName) => {
      // First, check if the endowment has a factory, and default to that.
      if (endowmentFactories.has(endowmentName)) {
        if (!hasProperty(attenuatedEndowments, endowmentName)) {
          // Call the endowment factory for the current endowment. If the factory
          // creates multiple endowments, they will all be assigned to the
          // `attenuatedEndowments` object, but will only be passed on to the snap
          // if explicitly listed among its endowment.
          // This may not have an actual use case, but, safety first.

          // We just confirmed that endowmentFactories has the specified key.
          const { teardownFunction, ...endowment } =
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            endowmentFactories.get(endowmentName)!();
          Object.assign(attenuatedEndowments, endowment);
          if (teardownFunction) {
            teardowns.push(teardownFunction);
          }
        }

        allEndowments[endowmentName] = attenuatedEndowments[endowmentName];
      } else if (endowmentName === 'ethereum') {
        // Special case for adding the EIP-1193 provider.
        allEndowments[endowmentName] = ethereum;
      } else if (endowmentName in rootRealmGlobal) {
        // If the endowment doesn't have a factory, just use whatever is on the
        // global object.
        const globalValue = (rootRealmGlobal as Record<string, unknown>)[
          endowmentName
        ];
        allEndowments[endowmentName] =
          typeof globalValue === 'function' && !isConstructor(globalValue)
            ? globalValue.bind(rootRealmGlobal)
            : globalValue;
      } else {
        // If we get to this point, we've been passed an endowment that doesn't
        // exist in our current environment.
        throw new Error(`Unknown endowment: "${endowmentName}".`);
      }
      return { allEndowments, teardowns };
    },
    {
      allEndowments: { snap },
      teardowns: [],
    },
  );

  const teardown = async () => {
    await Promise.all(
      result.teardowns.map((teardownFunction) => teardownFunction()),
    );
  };
  return { endowments: result.allEndowments, teardown };
}

/**
 * Checks whether the specified function is a constructor.
 *
 * @param value - Any function value.
 * @returns Whether the specified function is a constructor.
 */
// `Function` is exactly what we want here.
// eslint-disable-next-line @typescript-eslint/ban-types
export function isConstructor<T extends Function>(value: T): boolean {
  // In our current usage, the string `prototype.constructor.name` should never
  // be empty, because you can't create a class with no name, and the
  // `prototype.constructor.name` property is configurable but not writable.
  // Nevertheless, that property was the empty string for `Date` in the iframe
  // execution environment during local testing. We have no idea why, but we
  // have to handle that case.
  // TODO: Does the `prototype` object always have a `constructor` property?
  return Boolean(typeof value.prototype?.constructor?.name === 'string');
}
