import type { PackageManager } from './package-managers';

export type InstallFlowContext = {
  name: string;
  packageName: string;
  description?: string;
  packageManager: PackageManager;
};
