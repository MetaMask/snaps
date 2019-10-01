const { errors: rpcErrors } = require('eth-json-rpc-errors')
const IPFS = require('ipfs-mini');
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

wallet.registerRpcMessageHandler(async (originString, requestObject) => {
  switch (requestObject.method) {
    case 'add':
      console.log('adding', requestObject.params[0])
      return ipfs.add(requestObject.params[0])
    case 'cat':
      console.log('getting', requestObject.params[0])
      return ipfs.cat(requestObject.params[0])
    case 'addJSON':
      return ipfs.addJSON(requestObject.params[0])
    case 'catJSON':
      return ipfs.catJSON(requestObject.params[0])
    default:
      throw rpcErrors.eth.methodNotFound()
  }
})

