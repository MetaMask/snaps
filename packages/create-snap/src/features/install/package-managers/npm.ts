import { execa } from 'execa';

import type { PackageManager } from './package-manager.js';

/**
 * NPM package manager implementation.
 */
export const npm: PackageManager = {
  name: 'NPM',

  install: async (targetDirectory: string) => {
    await execa('npm', ['install'], {
      cwd: targetDirectory,
    });
  },
};
