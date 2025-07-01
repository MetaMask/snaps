import { npm } from './npm.js';
import { pnpm } from './pnpm.js';
import { yarn } from './yarn.js';

export type PackageManager = {
  /**
   * The name of the package manager.
   */
  name: string;

  /**
   * Install dependencies using the package manager.
   */
  install: (targetDirectory: string) => Promise<void>;
};

export const PACKAGE_MANAGERS = {
  npm,
  pnpm,
  yarn,
} as const;

/**
 *
 * @param name
 */
export function getPackageManagerByName(name: keyof typeof PACKAGE_MANAGERS) {
  const packageManager = PACKAGE_MANAGERS[name];
  if (!packageManager) {
    throw new Error(`Package manager "${name}" is not supported.`);
  }

  return packageManager;
}
