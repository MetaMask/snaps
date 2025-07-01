import type { PackageManager } from '../../package-managers/index.js';

export type InstallFlowContext = {
  template: string;
  metadata: {
    name: string;
    packageName: string;
    description?: string;
  };
  packageManager: PackageManager;
};
