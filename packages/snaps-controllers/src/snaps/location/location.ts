import type { SnapManifest, VirtualFile } from '@metamask/snaps-utils';
import { assert } from '@metamask/utils';

import { HttpLocation } from './http';
import { LocalLocation } from './local';
import type { NpmOptions } from './npm';
import { NpmLocation } from './npm';

declare module '@metamask/snaps-utils' {
  interface DataMap {
    /**
     * Fully qualified, canonical path for the file in {@link https://github.com/MetaMask/SIPs/blob/main/SIPS/sip-8.md SIP-8 } URI format.
     */
    canonicalPath: string;
  }
}

export interface SnapLocation {
  /**
   * All files are relative to the manifest, except the manifest itself.
   */
  manifest(): Promise<VirtualFile<SnapManifest>>;
  fetch(path: string): Promise<VirtualFile>;

  readonly shouldAlwaysReload?: boolean;
}

export type DetectSnapLocationOptions = NpmOptions & {
  /**
   * The function used to fetch data.
   *
   * @default globalThis.fetch
   */
  fetch?: typeof fetch;
  /**
   * @default false
   */
  allowHttp?: boolean;
  /**
   * @default false
   */
  allowLocal?: boolean;
};

/**
 * Auto-magically detects which SnapLocation object to create based on the provided {@link location}.
 *
 * @param location - A {@link https://github.com/MetaMask/SIPs/blob/main/SIPS/sip-8.md SIP-8} uri.
 * @param opts - NPM options and feature flags.
 * @returns SnapLocation based on url.
 */
export function detectSnapLocation(
  location: string | URL,
  opts?: DetectSnapLocationOptions,
): SnapLocation {
  const allowHttp = opts?.allowHttp ?? false;
  const allowLocal = opts?.allowLocal ?? false;
  const root = new URL(location);
  switch (root.protocol) {
    case 'npm:':
      return new NpmLocation(root, opts);
    case 'local:':
      assert(allowLocal, new TypeError('Fetching local snaps is disabled.'));
      return new LocalLocation(root, opts);
    case 'http:':
    case 'https:':
      assert(
        allowHttp,
        new TypeError('Fetching snaps through http/https is disabled.'),
      );
      return new HttpLocation(root, opts);
    default:
      throw new TypeError(
        `Unrecognized "${root.protocol}" snap location protocol.`,
      );
  }
}
