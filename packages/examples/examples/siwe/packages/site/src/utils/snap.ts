import { SiweMessage } from 'siwe';
import { getAddress } from 'ethers/lib/utils';
import { defaultSnapOrigin } from '../config';
import { GetSnapsResponse, Snap } from '../types';

/**
 * Get the installed snaps in MetaMask.
 *
 * @returns The snaps installed in MetaMask.
 */
export const getSnaps = async (): Promise<GetSnapsResponse> => {
  return (await window.ethereum.request({
    method: 'wallet_getSnaps',
  })) as unknown as GetSnapsResponse;
};

/**
 * Connect a snap to MetaMask.
 *
 * @param snapId - The ID of the snap.
 * @param params - The params to pass with the snap to connect.
 */
export const connectSnap = async (
  snapId: string = defaultSnapOrigin,
  params: Record<'version' | string, unknown> = {},
) => {
  await window.ethereum.request({
    method: 'wallet_requestSnaps',
    params: {
      [snapId]: params,
    },
  });
};

/**
 * Get the snap from MetaMask.
 *
 * @param version - The version of the snap to install (optional).
 * @returns The snap object returned by the extension.
 */
export const getSnap = async (version?: string): Promise<Snap | undefined> => {
  try {
    const snaps = await getSnaps();

    return Object.values(snaps).find(
      (snap) =>
        snap.id === defaultSnapOrigin && (!version || snap.version === version),
    );
  } catch (e) {
    console.log('Failed to obtain installed snap', e);
    return undefined;
  }
};

const mockRetrieveApiKeyFromServer = async (
  message: string,
  signature: string,
): Promise<string> => {
  console.log('Calling server to retrieve API key...', message, signature);
  await new Promise((r) => setTimeout(r, Math.random() * 1000));

  return `secret_key_${Math.random()}`;
};

export const signInWithEthereum = async () => {
  const accounts = await window.ethereum.request<string[]>({
    method: 'eth_requestAccounts',
  });

  const account = accounts?.[0];
  if (!account) {
    throw new Error('Must accept wallet connection request.');
  }

  const address = getAddress(account);

  const siweMessage = new SiweMessage({
    domain: window.location.hostname,
    uri: window.location.origin,
    version: '1',
    address,
    statement: 'Sign-in with Ethereum to authenticate your usage of the snap',
  });

  const signature = await window.ethereum.request<string>({
    method: 'personal_sign',
    params: [siweMessage.prepareMessage(), address],
  });

  if (!signature) {
    throw new Error('Must accept sign-in with ethereum request.');
  }

  const apiKey = await mockRetrieveApiKeyFromServer(
    siweMessage.toMessage(),
    signature,
  );

  await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: { method: 'set_api_key', params: { apiKey } },
    },
  });
};

export const signOut = async () => {
  await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: { method: 'remove_api_key' },
    },
  });
};

/**
 * Invoke the "is_signed_in" method from the siwe snap.
 */

export const checkIsSignedIn = async (): Promise<boolean> => {
  return Boolean(
    await window.ethereum.request({
      method: 'wallet_invokeSnap',
      params: {
        snapId: defaultSnapOrigin,
        request: { method: 'is_signed_in' },
      },
    }),
  );
};

/**
 * Invoke the "make_authenticated_request" method from the siwe snap.
 */

export const makeAuthenticatedRequest = async (): Promise<number> => {
  const result = await window.ethereum.request<{
    secretResult: number;
  }>({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: { method: 'make_authenticated_request' },
    },
  });

  if (typeof result?.secretResult !== 'number') {
    throw new Error(
      `Unexpected result from request: ${JSON.stringify(result)}`,
    );
  }

  return result.secretResult;
};

export const isLocalSnap = (snapId: string) => snapId.startsWith('local:');
