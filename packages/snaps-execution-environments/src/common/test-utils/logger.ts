import type { ConsoleLike } from '@metamask/providers/dist/utils';

export const SILENT_LOGGER: ConsoleLike = {
  log: () => undefined,
  warn: () => undefined,
  error: () => undefined,
  debug: () => undefined,
  info: () => undefined,
  trace: () => undefined,
};
