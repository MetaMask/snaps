// eslint-disable-next-line @typescript-eslint/triple-slash-reference, spaced-comment
/// <reference path="../../../../../node_modules/ses/index.d.ts" />

/**
 * Execute SES lockdown in the current context, i.e., the current iframe.
 *
 * @throws If the SES lockdown failed.
 */
export function executeLockdown() {
  try {
    lockdown({
      consoleTaming: 'unsafe',
      errorTaming: 'unsafe',
      mathTaming: 'unsafe',
      dateTaming: 'unsafe',
      overrideTaming: 'severe',
    });
  } catch (error) {
    // If the `lockdown` call throws an exception, it should not be able to continue
    console.error('Lockdown failed:', error);
    throw error;
  }
}
