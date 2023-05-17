import { OnRpcRequestHandler } from '@metamask/snaps-types';

const getApiKey = async () => {
  const state = await snap.request({
    method: 'snap_manageState',
    params: {
      operation: 'get',
    },
  });

  if (state && 'apiKey' in state && typeof state.apiKey === 'string') {
    return state.apiKey;
  }

  return null;
};

const setApiKey = (apiKey: string | null) => {
  return snap.request({
    method: 'snap_manageState',
    params: {
      operation: 'update',
      newState: {
        apiKey,
      },
    },
  });
};

const makeRequestWithApiKey = async (apiKey: string) => {
  console.log('Making authenticated API call from snap...', apiKey);
  // simulate API call with latency
  await new Promise((r) => setTimeout(r, Math.random() * 1000));
  return {
    secretResult: Math.random(),
  };
};

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'remove_api_key':
      await setApiKey(null);
      break;
    case 'set_api_key':
      if (
        'apiKey' in request.params &&
        typeof request.params.apiKey === 'string'
      ) {
        await setApiKey(request.params.apiKey);
        return true;
      }

      throw new Error('Must provide params.apiKey.');

    case 'is_signed_in':
      try {
        const apiKey = await getApiKey();
        return Boolean(apiKey);
      } catch (error) {
        return false;
      }

    case 'make_authenticated_request':
      // eslint-disable-next-line no-case-declarations
      const apiKey = await getApiKey();
      if (apiKey) {
        return makeRequestWithApiKey(apiKey);
      }

      throw new Error('Must SIWE before making request.');
    default:
      throw new Error('Method not found.');
  }
};
