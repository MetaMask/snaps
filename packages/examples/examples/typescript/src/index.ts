// TODO: Add proper types for `wallet` and other globals
declare global {
  const wallet: any;
}

wallet.registerRpcMessageHandler(
  async (originString: string, requestObject: Record<string, any>) => {
    switch (requestObject.method) {
      case 'hello':
        return wallet.request({
          method: 'snap_notify',
          params: [
            {
              type: 'native',
              message: `Hello, ${originString}!`,
            },
          ],
        });
      default:
        throw new Error('Method not found.');
    }
  },
);

export {};
