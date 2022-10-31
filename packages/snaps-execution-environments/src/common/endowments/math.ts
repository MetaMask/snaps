import { rootRealmGlobal } from '../globalObject';

/**
 * Create a {@link Math} object, with the same properties as the global
 * {@link Math} object, but with the {@link Math.random} method replaced with
 * one that throws an error.
 *
 * @returns The {@link Math} object with the {@link Math.random} method
 * replaced.
 */
function createMath() {
  // `Math` does not work with `Object.keys`, `Object.entries`, etc., so we
  // need to create a new object with the same properties.
  const keys = Object.getOwnPropertyNames(
    rootRealmGlobal.Math,
  ) as (keyof typeof Math)[];

  const math = keys.reduce<Math>((target, key) => {
    if (key === 'random') {
      return target;
    }

    return { ...target, [key]: rootRealmGlobal.Math[key] };
  }, {} as Math);

  return {
    Math: {
      ...math,
      random: () => {
        throw new Error(
          '`Math.random` is not supported. Use `crypto.getRandomValues` instead.',
        );
      },
    },
  };
}

const endowmentModule = {
  names: ['Math'] as const,
  factory: createMath,
};

export default endowmentModule;
