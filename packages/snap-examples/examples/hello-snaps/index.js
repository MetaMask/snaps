wallet.registerRpcMessageHandler(async (originString, requestObject) => {
  switch (requestObject.method) {
    case 'hello':
      return wallet.request({
        method: 'alert',
        params: [`Hello, ${originString}!`],
      });
    default:
      throw new Error('Method not found.');
  }
});
