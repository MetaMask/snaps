wallet.registerRpcMessageHandler(async (_originString, requestObject) => {
  switch (requestObject.method) {
    case 'setUseBlockie':
      return wallet.setUseBlockie(requestObject.params[0]);
    default:
      throw new Error('Method not found. From index.js');
  }
});
