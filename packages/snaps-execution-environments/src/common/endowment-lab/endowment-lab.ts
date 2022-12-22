// Endowment security testing
/**
 * Creates AbortController function hardened by SES.
 *
 * @returns An object with the attenuated `AbortController` function.
 */
const createAbortController = () => {
  return {
    AbortController: harden(AbortController),
  } as const;
};

const endowmentModule = {
  names: ['AbortController'] as const,
  factory: createAbortController,
};
export default endowmentModule;
