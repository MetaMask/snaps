const { errors: rpcErrors } = require('eth-json-rpc-errors')

wallet.registerRpcMessageHandler(async (originString, requestObject) => {
  switch (requestObject.method) {
    case 'ping':
      return pong(originString);
    default:
      throw rpcErrors.eth.methodNotFound()
  }
})

function pong (originString) {
  const approved = confirm('Do you want domain ' + originString +' to receive a pong?')
  if (approved) {
    return 'Pong!'
  } else {
    throw rpcErrors.eth.unauthorized()
  }
}

