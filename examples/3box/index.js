const IdentityWallet = require('identity-wallet')

let threeIdProvider
wallet.registerRpcMessageHandler(async (origin, req) => {
  if (!threeIdProvider) {
    const appKey = await getAppKey()
    const idWallet = new IdentityWallet(() => true, { seed: appKey })
    threeIdProvider = idWallet.get3idProvider()
  }
  return threeIdProvider.send(req, origin)
})

async function getAppKey () {
  const appKey = await wallet.getAppKey()
  if (!appKey.startsWith('0x')) {
    return '0x' + appKey
  }
  return appKey
}
