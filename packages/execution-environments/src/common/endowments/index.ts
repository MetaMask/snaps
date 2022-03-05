import { SnapProvider } from '@metamask/snap-types';
import { rootRealmGlobal } from '../globalObject';
import buffer from './buffer';
import timeout from './timeout';
import wasm from './wasm';

/**
 * A map of endowment names to their factory functions. Some endowments share
 * the same factory function, but we only call each factory once for each snap.
 * See {@link createEndowments} for details.
 */
const endowmentFactories = [buffer, timeout, wasm].reduce(
  (factories, builder) => {
    builder.names.forEach((name) => {
      factories.set(name, builder.factory);
    });
    return factories;
  },
  new Map<string, () => unknown>(),
);

/**
 * Gets the endowments for a particular Snap. Some endowments, like `setTimeout`
 * and `clearTimeout`, must be attenuated so that they can only affect behavior
 * within the Snap's own realm. Therefore, we use factory functions to create
 * such attenuated / modified endowments. Otherwise, the value that's on the
 * root realm global will be used.
 *
 * @param wallet - The Snap's provider object.
 * @param _endowments - The list of endowments to provide to the snap.
 * @returns An object containing the Snap's endowments.
 */
export function createEndowments(
  wallet: SnapProvider,
  _endowments: string[] = [],
): Record<string, unknown> {
  const endowments: Record<string, unknown> = { wallet };

  const attenuatedEndowments: Record<string, unknown> = {};

  _endowments.forEach((endowmentName) => {
    // First, check if the endowment has a factory, and default to that.
    if (endowmentFactories.has(endowmentName)) {
      if (!Object.hasOwnProperty.call(attenuatedEndowments, endowmentName)) {
        // Call the endowment factory for the current endowment. If the factory
        // creates multiple endowments, they will all be assigned to the
        // `attenuatedEndowments` object, but will only be passed on to the snap
        // if explicitly listed among its endowment.
        // This may not have an actual use case, but, safety first.
        Object.assign(
          attenuatedEndowments,
          // We just confirmed that endowmentFactories has the specified key.
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          endowmentFactories.get(endowmentName)!(),
        );
      }

      endowments[endowmentName] = attenuatedEndowments[endowmentName];
    } else if (endowmentName in rootRealmGlobal) {
      // If the endowment doesn't have a factory, just use whatever is on the
      // global object.
      const globalValue = (rootRealmGlobal as Record<string, unknown>)[
        endowmentName
      ];

      // Bind functions to prevent shenanigans.
      endowments[endowmentName] =
        typeof globalValue === 'function'
          ? globalValue.bind(rootRealmGlobal)
          : globalValue;
    } else {
      // If we get to this point, we've been passed an endowment that doesn't
      // exist in our current environment.
      throw new Error(`Unknown endowment: "${endowmentName}".`);
    }
  });

  return endowments;
}
