import { VirtualFile } from '@metamask/snaps-utils';
import { stringToBytes } from '@metamask/utils';

export const MOCK_SNAP_SOURCE = `
module.exports.onRpcRequest = ({ request }) => {
  console.log("Hello, world!");

  const { method, id } = request;
  return method + id;
};
`;

export const MOCK_SNAP_SOURCE_FILE = new VirtualFile<string>(
  stringToBytes(MOCK_SNAP_SOURCE),
);
MOCK_SNAP_SOURCE_FILE.path = 'dist/bundle.js';
MOCK_SNAP_SOURCE_FILE.data = {
  canonicalPath: `local:http://localhost:8080/${MOCK_SNAP_SOURCE_FILE.path}`,
};

export const MOCK_SNAP_ICON = 'foo';

export const MOCK_SNAP_ICON_FILE = new VirtualFile<string>(
  stringToBytes(MOCK_SNAP_ICON),
);
MOCK_SNAP_ICON_FILE.path = 'images/icon.svg';
MOCK_SNAP_ICON_FILE.data = {
  canonicalPath: `local:http://localhost:8080/${MOCK_SNAP_ICON_FILE.path}`,
};
