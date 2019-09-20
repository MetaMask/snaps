const { errors: rpcErrors } = require('eth-json-rpc-errors')
const bls = require('noble-bls12-381')

const DOMAIN = 2;
const PRIVATE_KEY_PROMISE = getAppKey();

wallet.registerRpcMessageHandler(async (_originString, requestObject) => {
  switch (requestObject.method) {

    case 'getAccount':
      return getPubKey();

    case 'signMessage':
      const pubKey = await getPubKey();
      const data = requestObject.params[0]
      const approved = await promptUser(`Do you want to BLS sign ${data} with ${pubKey}?`)
      if (!approved) {
        throw rpcErrors.eth.unauthorized()
      }
      const PRIVATE_KEY = await PRIVATE_KEY_PROMISE;
      const signature = await bls.sign(requestObject.params[0], PRIVATE_KEY, DOMAIN);
      return signature

    default:
      throw rpcErrors.methodNotFound()
  }
})

async function getPubKey () {
  const PRIV_KEY = await PRIVATE_KEY_PROMISE;
  return bls.getPublicKey(PRIV_KEY);
}

async function promptUser (message) {
  const response = await wallet.send({ method: 'confirm', params: [message] })
  return response.result
}

// Return app key or wait for unlock:
async function getAppKey () {
  return new Promise((res, rej) => {
    let key
    try {
      key = wallet.getAppKey();
      return res(key)
    } catch (err) {
      wallet.onUnlock(() => {
        key = wallet.getAppKey();
        res(key)
      })
    }
  })
}

