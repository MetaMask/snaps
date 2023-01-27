/**
 * Creates TextEncoder function hardened by SES.
 *
 * @returns An object with the attenuated `TextEncoder` function.
 */
const createTextEncoder = () => {
  return {
    TextEncoder: harden(TextEncoder),
  } as const;
};

const endowmentModule = {
  names: ['TextEncoder'] as const,
  factory: createTextEncoder,
};
export default endowmentModule;
