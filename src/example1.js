(() => {
  ethereum.onNewTx(txMeta => {
    let state = ethereum.getPluginState()
    ethereum.updatePluginState({  [txMeta.txParams.from]: state[txMeta.txParams.from] + 1 })
    state = ethereum.getPluginState()
    console.log('Number of transactions sent by address', JSON.stringify(state, null, 2));
  })
})
