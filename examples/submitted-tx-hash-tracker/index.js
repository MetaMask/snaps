const { errors: rpcErrors } = require('eth-json-rpc-errors')

wallet.updatePluginState({
  successfulTxHashes: [],
})

wallet.onMetaMaskEvent('tx:status-update', (id, status) => {
  if (status === 'submitted') {
    const currentPluginState = wallet.getPluginState()
    const txMeta = wallet.getTxById(id)
    wallet.updatePluginState({
      ...currentPluginState,
      successfulTxHashes: [...currentPluginState.successfulTxHashes, txMeta.hash],
    })
  }
})

wallet.registerRpcMessageHandler(async (originString, requestObject) => {
  switch (requestObject.method) {
    case 'getSuccessfulTxHashes':
      return wallet.getPluginState().successfulTxHashes
    default:
      throw rpcErrors.eth.methodNotFound(requestObject)
  }
})

