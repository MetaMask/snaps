import { execa } from 'execa';

import type { PackageManager } from './package-manager.js';

/**
 * NPM package manager implementation.
 */
export const pnpm: PackageManager = {
  name: 'PNPM',

  install: async (targetDirectory: string) => {
    await execa('pnpm', ['install'], {
      cwd: targetDirectory,
    });
  },
};
