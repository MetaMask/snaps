/**
 * Creates TextDecoder function hardened by SES.
 *
 * @returns An object with the attenuated `TextDecoder` function.
 */
const createTextDecoder = () => {
  return {
    TextDecoder: harden(TextDecoder),
  } as const;
};

const endowmentModule = {
  names: ['TextDecoder'] as const,
  factory: createTextDecoder,
};
export default endowmentModule;
