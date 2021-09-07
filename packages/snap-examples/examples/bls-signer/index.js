const { errors: rpcErrors } = require('eth-json-rpc-errors');
const bls = require('noble-bls12-381');

const DOMAIN = 2;

console.log('Hello from bls-snap!');

wallet.registerRpcMessageHandler(async (_originString, requestObject) => {
  switch (requestObject.method) {
    case 'getAccount':
      return getPubKey();

    case 'signMessage': {
      const pubKey = await getPubKey();
      const data = requestObject.params[0];
      const approved = await promptUser(
        `Do you want to BLS sign ${data} with ${pubKey}?`,
      );
      if (!approved) {
        throw rpcErrors.eth.unauthorized();
      }
      const PRIVATE_KEY = await wallet.request({
        method: 'snap_getAppKey',
      });
      const signature = await bls.sign(
        requestObject.params[0],
        PRIVATE_KEY,
        DOMAIN,
      );
      return signature;
    }

    default:
      throw rpcErrors.methodNotFound(requestObject);
  }
});

async function getPubKey() {
  const PRIV_KEY = await wallet.request({
    method: 'snap_getAppKey',
  });
  return bls.getPublicKey(PRIV_KEY);
}

async function promptUser(message) {
  const response = await wallet.request({
    method: 'snap_confirm',
    params: [message],
  });
  return response;
}
