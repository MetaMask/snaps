wallet.registerRpcMessageHandler(async (originString, requestObject) => {
    switch (requestObject.method) {
      case 'setUseBlockie':
        return wallet.setUseBlockie(requestObject.params[0])
      break
      default:
        throw new Error('Method not found. From index.js')
    }
  })
  