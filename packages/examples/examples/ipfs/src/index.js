const { errors: rpcErrors } = require('eth-json-rpc-errors');
const { IPFS } = require('./ipfs');

const ipfs = new IPFS({
  host: 'ipfs.infura.io',
  protocol: 'https',
});

module.exports.onRpcRequest = async ({ request }) => {
  switch (request.method) {
    case 'add':
      return await ipfs.add(request.params[0]);
    case 'cat':
      return await ipfs.cat(request.params[0]);
    default:
      throw rpcErrors.eth.methodNotFound(request);
  }
};
