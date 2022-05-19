const { errors: rpcErrors } = require('eth-json-rpc-errors');
const { IPFS } = require('./ipfs');

const ipfs = new IPFS({
  host: 'ipfs.infura.io',
  protocol: 'https',
});

module.exports.onRPC = async (_originString, requestObject) => {
  switch (requestObject.method) {
    case 'add':
      return await ipfs.add(requestObject.params[0]);
    case 'cat':
      return await ipfs.cat(requestObject.params[0]);
    default:
      throw rpcErrors.eth.methodNotFound(requestObject);
  }
};
