const { errors: rpcErrors } = require('eth-json-rpc-errors')
const IPFS = require('ipfs-mini');
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

wallet.registerRpcMessageHandler(async (originString, requestObject) => {
  switch (requestObject.method) {
    case 'add':
      return ipfs.add(requestObject.params[0])
    case 'cat':
      return ipfs.cat(requestObject.params[0])
    case 'addJSON':
      return ipfs.addJSON(requestObject.params[0])
    case 'catJSON':
      return ipfs.catJSON(requestObject.params[0])
    default:
      throw rpcErrors.eth.methodNotFound(requestObject)
  }
})

