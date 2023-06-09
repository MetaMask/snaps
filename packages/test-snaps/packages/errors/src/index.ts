import { OnRpcRequestHandler } from '@metamask/snaps-types';

export const onRpcRequest: OnRpcRequestHandler = async () => {
  // eslint-disable-next-line no-new, @typescript-eslint/no-floating-promises
  new Promise<void>((resolve) => {
    let value = 0;
    while (value < 100) {
      // eslint-disable-next-line no-plusplus
      value++;
    }

    throw new Error('Random error inside a promise.');

    resolve();
  });

  return 'foo';
};
