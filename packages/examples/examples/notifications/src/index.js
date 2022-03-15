wallet.registerRpcMessageHandler(async (originString, requestObject) => {
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
});
