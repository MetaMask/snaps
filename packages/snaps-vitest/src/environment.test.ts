import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, it, vi } from 'vitest';

import Environment, { SnapsEnvironment } from './environment';

const ROOT = resolve(
  fileURLToPath(new URL('.', import.meta.url)),
  './test-utils/snap',
);

const ENVIRONMENT_OPTIONS = {
  server: {
    root: ROOT,
  },
};

describe('SnapsEnvironment', () => {
  it('is exported as a valid Vitest environment', () => {
    expect(Environment).toMatchObject({
      name: 'snaps-vitest',
      transformMode: 'ssr',
    });

    expect(Environment.setup).toBeInstanceOf(Function);
  });

  it('starts a server if enabled', async () => {
    const environment = new SnapsEnvironment(ENVIRONMENT_OPTIONS);

    await environment.setup({});
    expect(environment.snapId).toMatch(/^local:http:\/\/localhost:\d+$/u);

    await environment.teardown();
  });

  it('throws when trying to access the snap ID when the server is disabled', async () => {
    const environment = new SnapsEnvironment({
      ...ENVIRONMENT_OPTIONS,
      server: {
        enabled: false,
      },
    });

    await environment.setup({});
    expect(() => environment.snapId).toThrow(
      'You must specify a snap ID, because the built-in server is not running.',
    );

    await environment.teardown();
  });

  describe('installSnap', () => {
    it('installs a Snap and keeps track of it, terminating any previously installed Snaps', async () => {
      vi.spyOn(console, 'log').mockImplementation(() => undefined);

      const environment = new SnapsEnvironment(ENVIRONMENT_OPTIONS);

      await environment.setup({});

      const instance = await environment.installSnap();
      expect(instance?.executionService).toBeDefined();

      const terminateSpy = vi.spyOn(
        instance?.executionService,
        'terminateAllSnaps',
      );

      const secondInstance = await environment.installSnap();
      expect(terminateSpy).toHaveBeenCalledTimes(1);
      expect(secondInstance?.executionService).toBeDefined();
      expect(secondInstance?.executionService).not.toBe(
        instance?.executionService,
      );

      await environment.teardown();
    });
  });
});
