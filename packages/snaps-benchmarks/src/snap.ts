import { JsonRpcRequest } from '@metamask/utils';

export const DEFAULT_SNAP_BUNDLE = `
  const ENCRYPTION_ALGORITHM = 'AES-GCM';
  const ENCRYPTION_KEY_LENGTH = 256;
  const ENCRYPTION_MESSAGE_LENGTH = 10 ** 5;

  module.exports.onRpcRequest = async () => {
    // We can't use \`crypto.getRandomValues\` here because it has a limited amount
    // of entropy. Since this is just a benchmark, we don't care about the
    // security of the random bytes.
    const randomBytes = new Uint8Array(ENCRYPTION_MESSAGE_LENGTH)
      .fill(0)
      .map(() => Math.round(Math.random() * 0xff));

    const privateKey = await crypto.subtle.generateKey(
      { name: ENCRYPTION_ALGORITHM, length: ENCRYPTION_KEY_LENGTH },
      true,
      ['encrypt'],
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    await crypto.subtle.encrypt(
      { name: ENCRYPTION_ALGORITHM, iv },
      privateKey,
      randomBytes,
    );

    return 'OK';
  };
`;

export const DEFAULT_JSON_RPC_REQUEST: JsonRpcRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'foo',
  params: [],
};
