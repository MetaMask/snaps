declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    ethereum: any;
  }
}

/**
 * Install a Snap, and return a proxy object that can be used to call the Snap
 * methods.
 *
 * @param snapId - The ID of the Snap to install.
 * @param version - The version of the Snap to install. If not specified, the
 * latest version will be installed.
 * @returns A proxy object that can be used to call the Snap methods.
 */
export async function installSnap(snapId: string, version?: string) {
  await window.ethereum.request({
    method: 'wallet_requestSnaps',
    params: {
      [snapId]: {
        version,
      },
    },
  });

  return new Proxy(Object.create(null), {
    get: (_, method) => {
      // JavaScript calls `.then` automatically on promises, so we need to
      // return `undefined` here to avoid calling the `then` method on the
      // proxy.
      // See: https://stackoverflow.com/a/48321786/11285318
      if (method === 'then') {
        return undefined;
      }

      return async (params: unknown) => {
        return await window.ethereum.request({
          method: 'wallet_invokeSnap',
          params: {
            snapId,
            request: {
              method,
              params,
            },
          },
        });
      };
    },
  });
}
