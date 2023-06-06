import {
  boolean,
  create,
  defaulted,
  Infer,
  object,
  optional,
  string,
  type,
} from 'superstruct';

export const SnapsEnvironmentOptionsStruct = type({
  executionEnvironmentUrl: optional(string()),
  simulatorUrl: optional(string()),

  browserOptions: defaulted(
    object({
      headless: defaulted(boolean(), true),
    }),
    {},
  ),
});

export type SnapsEnvironmentOptions = Infer<
  typeof SnapsEnvironmentOptionsStruct
>;

/**
 * Get the environment options. This validates the options, and returns the
 * default options if none are provided.
 *
 * @param testEnvironmentOptions - The test environment options as defined in
 * the Jest configuration.
 * @returns The environment options.
 */
export function getOptions(testEnvironmentOptions: Record<string, unknown>) {
  return create(testEnvironmentOptions, SnapsEnvironmentOptionsStruct);
}
