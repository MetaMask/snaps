import { assert } from '@metamask/utils';

/**
 * Get the current count from the Snap state.
 *
 * @returns The current count.
 */
export async function getCurrent(): Promise<number> {
  const state = await snap.request({
    method: 'snap_manageState',
    params: {
      operation: 'get',
    },
  });

  if (!state) {
    return 0;
  }

  assert(typeof state.count === 'number', 'Expected count to be a number.');
  return state.count;
}

/**
 * Increment the count in the Snap state.
 *
 * @returns The new count.
 */
export async function increment() {
  const count = await getCurrent();
  const newState = {
    count: count + 1,
  };

  await snap.request({
    method: 'snap_manageState',
    params: {
      operation: 'update',
      newState,
    },
  });

  return newState.count;
}
