// These are fake types just to make this test work with the TypeScript
/* eslint-disable @typescript-eslint/naming-convention */
export type HardenedEndowmentSubject = {
  __flag: unknown;
  prototype: { __flag: unknown };
};

export type HardenedEndowmentInstance = {
  __flag: unknown;
  __proto__: { __flag: unknown };
};
/* eslint-enable @typescript-eslint/naming-convention */

/**
 * This function represents utility which is executed inside a compartment.
 * It will try to change a subject or its prototype.
 * Potential errors are caught and reported in an array returned.
 *
 * @param subject - Test subject (instance, object, function).
 * @param factory - Factory that creates an instance using constructor function.
 * @returns Array of error messages.
 */
export function testEndowmentHardening(
  subject: HardenedEndowmentSubject,
  factory: () => HardenedEndowmentInstance,
): unknown[] {
  const log = [];
  const instance = factory();
  try {
    subject.__flag = 'not_secure';
  } catch (error) {
    log.push(error.message);
  }
  try {
    if (instance) {
      instance.__flag = 'not_secure';
    }
  } catch (error) {
    log.push(error.message);
  }
  try {
    subject.prototype.__flag = 'not_secure';
  } catch (error) {
    log.push(error.message);
  }
  try {
    // eslint-disable-next-line no-proto
    instance.__proto__.__flag = 'not_secure';
  } catch (error) {
    log.push(error.message);
  }
  try {
    // @ts-expect-error Test unusual approach for a security reasons.
    // eslint-disable-next-line no-proto
    subject.__proto__.__flag = 'not_secure';
  } catch (error) {
    log.push(error.message);
  }
  return log;
}
