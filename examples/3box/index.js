const IdentityWallet = require('identity-wallet')

let threeIdProvider
wallet.registerRpcMessageHandler(async (origin, req) => {
  if (!threeIdProvider) {
    const idWallet = new IdentityWallet(() => true, { seed: '0x' + (await wallet.getAppKey()) })
    threeIdProvider = idWallet.get3idProvider()
  }
  return threeIdProvider.send(req, origin)
})
