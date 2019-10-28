const { errors: rpcErrors } = require('eth-json-rpc-errors')

const pingListeners = [];
let pingCount = 0;

wallet.registerApiRequestHandler(async (origin) => {

  return {

    ping: () => {
      trackPings(origin);
      return 'pong'
    },

    // We're going to create an event for notifying the listener
    // Whenever a ping is initiated!
    on: (eventName, callback) => {
      switch (eventName) {
        case 'ping':
          pingListeners.push(callback);
          return true
        default:
          throw rpcErrors.methodNotFound(requestObject)
      }
    }
  }

})

function trackPings (origin) {
  pingCount++
  const notice = {
    origin,
    pingCount,
  }
  pingListeners.forEach((listener) => {
    listener(notice)
    .catch((err) => {
      console.error('Unable to deliver ping notice', err)
    })
  })
}
