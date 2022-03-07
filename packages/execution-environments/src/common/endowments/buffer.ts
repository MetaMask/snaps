/**
 * Returns a `Buffer` endowment. This mainly exists so that our build system
 * will reliably inline a `Buffer` implementation when targeting browser
 * environments.
 *
 * @returns An object with a cross-platform `Buffer` property.
 */
const createBuffer = () => {
  return { Buffer } as const;
};

const endowmentModule = {
  names: ['Buffer'] as const,
  factory: createBuffer,
};
export default endowmentModule;
