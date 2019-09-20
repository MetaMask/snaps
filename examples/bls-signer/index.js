const { errors: rpcErrors } = require('eth-json-rpc-errors')
const bls = require('noble-bls12-381')

const DOMAIN = 2;
const PRIVATE_KEY_PROMISE = wallet.getAppKey();

wallet.registerRpcMessageHandler(async (_originString, requestObject) => {
  switch (requestObject.method) {

    case 'getAccount':
      return getPubKey();

    case 'signMessage':
      const pubKey = await getPubKey();
      const data = requestObject.params[0]
      const approved = confirm(`Do you want to sign ${data} with ${pubKey}?`)
      if (!approved) {
        throw rpcErrors.eth.unauthorized()
      }
      const PRIVATE_KEY = await PRIVATE_KEY_PROMISE;
      const signature = await bls.sign(requestObject.params[0], PRIVATE_KEY, DOMAIN);
      return signature

    default:
      throw rpcErrors.eth.methodNotFound()
  }
})

async function getPubKey () {
  const PRIV_KEY = await PRIVATE_KEY_PROMISE;
  return bls.getPublicKey(PRIV_KEY);
}

