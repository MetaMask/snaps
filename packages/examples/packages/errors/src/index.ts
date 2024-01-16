import type { OnRpcRequestHandler } from '@metamask/snaps-sdk';

export const onRpcRequest: OnRpcRequestHandler = async () => {
  // eslint-disable-next-line no-new, @typescript-eslint/no-floating-promises
  new Promise<void>((_resolve, reject) => {
    setTimeout(() => {
      reject(new Error('Random error inside a promise.'));
    }, 1000);
  });

  return 'Hello, world!';
};
