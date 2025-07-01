import { execa } from 'execa';

import type { PackageManager } from './package-manager.js';

/**
 * Yarn package manager implementation.
 *
 * This uses the `yarn set version stable` command to ensure the latest stable
 * version of Yarn is used.
 */
export const yarn: PackageManager = {
  name: 'Yarn (recommended)',

  install: async (targetDirectory: string) => {
    await execa('yarn', ['set', 'version', 'stable'], {
      cwd: targetDirectory,
    });

    await execa('yarn', ['install'], {
      cwd: targetDirectory,
    });
  },
};
