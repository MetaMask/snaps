import { type SnapId } from '@metamask/snaps-sdk';
import { type Infer, is, pattern, string } from '@metamask/superstruct';
import { assert } from '@metamask/utils';

import { assertIsValidSnapId, stripSnapPrefix } from './snaps';

export const METAMASK_URL_REGEX =
  /^metamask:\/\/(?<authority>(client|snap))(?<path>.+)$/u;

export const MetaMaskUrlStruct = pattern(string(), METAMASK_URL_REGEX);

export type MetaMaskUrl = Infer<typeof MetaMaskUrlStruct>;

export type Authority = 'client' | 'snap';

export const ExtensionPaths = ['/'];

export const SnapPaths = ['/home'];

/**
 * Parse a url string to an object containing the authority and path.
 * This validates the url before parsing it.
 *
 * @param url - The url to validate and parse.
 * @returns The parsed url.
 * @throws If the authority or path is invalid.
 */
export function parseMetaMaskUrl(url: MetaMaskUrl): {
  authority: Authority;
  snapId?: SnapId;
  path: string;
} {
  const match = METAMASK_URL_REGEX.exec(url);
  if (!match?.groups) {
    throw new Error('Invalid MetaMask url.');
  }

  const { authority, path } = match.groups;

  if (authority === 'client') {
    assert(ExtensionPaths.includes(path), 'Invalid client path.');
    return {
      authority,
      path,
    };
  } else if (authority === 'snap') {
    const strippedPath = stripSnapPrefix(path.slice(1));
    const location = path.slice(1).startsWith('npm:') ? 'npm:' : 'local:';
    const isNameSpaced = strippedPath.startsWith('@');
    const pathTokens = strippedPath.split('/');
    const lastPathToken = `/${pathTokens[pathTokens.length - 1]}`;
    let partialSnapId;
    if (location === 'local:') {
      partialSnapId = `http://${pathTokens[2]}`;
      assert(
        pathTokens.length === 4 && SnapPaths.includes(lastPathToken),
        'Invalid snap path.',
      );
    } else {
      partialSnapId = isNameSpaced
        ? `${pathTokens[0]}/${pathTokens[1]}`
        : pathTokens[0];
      assert(
        isNameSpaced
          ? pathTokens.length === 3 && SnapPaths.includes(lastPathToken)
          : pathTokens.length === 2 && SnapPaths.includes(lastPathToken),
        'Invalid snap path.',
      );
    }
    const snapId = `${location}${partialSnapId}`;
    assertIsValidSnapId(snapId);

    return {
      authority,
      snapId,
      path: lastPathToken,
    };
  }
  // You don't ever actually reach this line, TS doesn't know that no other authority will make it past
  // the regex statement
  /* istanbul ignore next */
  throw new Error('Invalid authority');
}

/**
 * Check if the given value is a MetaMask url.
 *
 * @param value - The value to check.
 * @returns Whether the value is a MetaMask url.
 */
export function isMetaMaskUrl(value: unknown): value is MetaMaskUrl {
  return is(value, MetaMaskUrlStruct);
}
