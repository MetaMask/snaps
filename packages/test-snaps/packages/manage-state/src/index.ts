import { OnRpcRequestHandler } from '@metamask/snaps-types';

export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  let state = (await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  })) as { testState: string[] } | null;

  if (!state) {
    state = { testState: [] };
    // initialize state if empty and set default data
    await snap.request({
      method: 'snap_manageState',
      params: { operation: 'update', newState: state },
    });
  }

  switch (request.method) {
    case 'storeTestData':
      state.testState.push((request.params as string[])[0]);
      await snap.request({
        method: 'snap_manageState',
        params: { operation: 'update', newState: state },
      });
      return true;
    case 'retrieveTestData':
      return await snap.request({
        method: 'snap_manageState',
        params: { operation: 'get' },
      });
    case 'clearTestData':
      await snap.request({
        method: 'snap_manageState',
        params: { operation: 'clear' },
      });
      return true;

    default:
      throw new Error('Method not found.');
  }
};
