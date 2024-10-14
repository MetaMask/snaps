import { type SnapId } from '@metamask/snaps-sdk';
import { assert } from '@metamask/utils';

import { assertIsValidSnapId, stripSnapPrefix } from './snaps';

export type Authority = 'client' | 'snap';

export const CLIENT_PATHS = ['/'];

export const SNAP_PATHS = ['/home'];

/**
 * Parse a url string to an object containing the authority, path and Snap id (if snap authority).
 * This also validates the url before parsing it.
 *
 * Note: The Snap id returned from this function should always be validated to be an installed snap.
 *
 * @param str - The url string to validate and parse.
 * @returns A parsed url object.
 * @throws If the authority or path is invalid.
 */
export function parseMetaMaskUrl(str: string): {
  authority: Authority;
  snapId?: SnapId;
  path: string;
} {
  const url = new URL(str);
  const { protocol } = url;
  if (protocol !== 'metamask:') {
    throw new Error(
      `Unable to parse URL. Expected the protocol to be "metamask:", but received "${protocol}".`,
    );
  }

  // The browser version of URL differs from the Node version so we rely on the href
  // property to grab the relevant parts of the url instead of hostname and pathname
  const [authority, ...pathElements] = url.href
    .replace('metamask://', '')
    .split('/');
  const path = `/${pathElements.join('/')}`;

  switch (authority) {
    case 'client':
      assert(
        CLIENT_PATHS.includes(path),
        `Unable to navigate to "${path}". The provided path is not allowed.`,
      );
      return {
        authority,
        path,
      };
    case 'snap':
      return parseSnapPath(path);
    default:
      throw new Error(
        `Expected "metamask:" URL to start with "client" or "snap", but received "${authority}".`,
      );
  }
}

/**
 * Parse a snap path and throws if it is invalid, returns an object with link data otherwise.
 *
 * @param path - The snap path to be parsed.
 * @returns A parsed url object.
 * @throws If the path or Snap id is invalid.
 */
function parseSnapPath(path: string): {
  authority: Authority;
  snapId: SnapId;
  path: string;
} {
  const baseErrorMessage = 'Invalid MetaMask url:';
  const strippedPath = stripSnapPrefix(path.slice(1));
  const location = path.slice(1).startsWith('npm:') ? 'npm:' : 'local:';
  const isNameSpaced = strippedPath.startsWith('@');
  const pathTokens = strippedPath.split('/');
  const lastPathToken = `/${pathTokens[pathTokens.length - 1]}`;
  let partialSnapId;
  if (location === 'local:') {
    const [localProtocol, , ...rest] = pathTokens.slice(0, -1);
    partialSnapId = `${localProtocol}//${rest.join('/')}`;
    // we can't make assumptions of the structure of the local snap url since it can have a nested path
    // so we only check that the last path token is one of the allowed paths
    assert(
      SNAP_PATHS.includes(lastPathToken),
      `${baseErrorMessage} invalid snap path.`,
    );
  } else {
    partialSnapId = isNameSpaced
      ? `${pathTokens[0]}/${pathTokens[1]}`
      : pathTokens[0];
    assert(
      isNameSpaced
        ? pathTokens.length === 3 && SNAP_PATHS.includes(lastPathToken)
        : pathTokens.length === 2 && SNAP_PATHS.includes(lastPathToken),
      `${baseErrorMessage} invalid snap path.`,
    );
  }
  const snapId = `${location}${partialSnapId}`;
  assertIsValidSnapId(snapId);

  return {
    authority: 'snap' as Authority,
    snapId,
    path: lastPathToken,
  };
}
