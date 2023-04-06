/**
 * Create a a {@link console} object, with the same properties as the global
 * {@link console} object, but with some methods replaced.
 *
 * @returns The {@link console} object with the replaced methods.
 */
function createConsole() {
  return {};
}

const endowmentModule = {
  names: ['console'] as const,
  factory: createConsole,
};

export default endowmentModule;
