import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { panel, text } from '@metamask/snaps-ui';

import packageJson from '../package.json';

/**
 * Retrieves test web page content.
 *
 * @returns Response data of a fetched web page in json format.
 */
async function getJson() {
  const response = await fetch(
    `https://metamask.github.io/test-snaps/${packageJson.version}/test-data.json`,
  );
  return response.json();
}

export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'networkAccessTest': {
      const json = await getJson();
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'alert',
          content: panel([text(json.result)]),
        },
      });
    }
    default:
      throw new Error('Method not found.');
  }
};
