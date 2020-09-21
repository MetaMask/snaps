/* global Compartment, lockdown */ 

const Dnode = require('dnode')
const { MetamaskInpageProvider } = require('@metamask/inpage-provider')
const ObjectMultiplex = require('obj-multiplex')
const pump = require('pump')
const { WorkerPostMessageStream } = require('post-message-stream')
const { PLUGIN_STREAM_NAMES } = require('./enums')
const pify = require('pify')

// require('ses/dist/lockdown.cjs')
require('./lockdown.cjs')
// now we SES globals

lockdown({
  // we wouldn't do this in prod
  mathTaming: 'unsafe',
  errorTaming: 'unsafe',
  dateTaming: 'unsafe',
})

init()

async function init () {
  // streams
  self.backgroundApi = null
  self.rpcStream = null
  self.command = null

  // rpc handler function
  self.pluginRpcHandler = null

  // we actually only do a single plugin for now, but in the future...
  self.plugins = new Map()

  await connectToParent()
}

/**
 * Establishes a streamed connection to the background account manager
 */
function connectToParent () {

  console.log('CONNECTING TO PARENT')

  const parentStream = new WorkerPostMessageStream()
  const mux = setupMultiplex(parentStream, 'Parent')

  self.command = mux.createStream(PLUGIN_STREAM_NAMES.COMMAND)
  self.command.on('data', _onCommandMessage)

  self.rpcStream = mux.createStream(PLUGIN_STREAM_NAMES.JSON_RPC)

  const backgroundApiStream = mux.createStream(PLUGIN_STREAM_NAMES.BACKGROUND_API)
  return new Promise((resolve, _reject) => {
    const dnode = Dnode()
    backgroundApiStream.pipe(dnode).pipe(backgroundApiStream)
    dnode.once('remote', (metamaskConnection) => {
      self.backgroundApi = pify(metamaskConnection)
      resolve()
    })
  })
}

function _onCommandMessage (message) {

  if (typeof message !== 'object') {
    console.error('Command stream received non-object message.')
    return
  }

  const { id, command, data } = message

  const respond = (obj) => {
    self.command.write({ ...obj, id })
  }

  switch (command) {

    case 'installPlugin':
      installPlugin(data)
        .then(() => {
          respond({ result: 'OK' })
        })
        .catch((error) => {
          respond({ error: error.message })
        })
      break

    case 'ping':
      respond({ result: 'OK' })
      break

    case 'pluginRpc':
      if (!self.pluginRpcHandler) {
        respond({
          error: new Error('No RPC handler registered for plugin.')
        })
        break
      }
      const { origin, request } = data
      self.pluginRpcHandler(origin, request)
        .then((result) => {
          respond({ result })
        })
        .catch((error) => {
          respond({ error })
        })
      break

    default:
      console.error(`Unrecognized command: ${command}.`)
      break
  }
}

async function installPlugin ({
  pluginName,
  // approvedPermissions,
  sourceCode,
  backgroundApiKeys,
} = {}) {

  const ethereumProvider = new MetamaskInpageProvider(self.rpcStream, {
    shouldSendMetadata: false,
  })

  _startPlugin(pluginName, null, sourceCode, ethereumProvider, backgroundApiKeys)
}

/**
 * Attempts to evaluate a plugin in SES.
 * Generates the APIs for the plugin. May throw on error.
 *
 * @param {string} pluginName - The name of the plugin.
 * @param {Array<string>} approvedPermissions - The plugin's approved permissions.
 * Should always be a value returned from the permissions controller.
 * @param {string} sourceCode - The source code of the plugin, in IIFE format.
 * @param {Object} ethereumProvider - The plugin's Ethereum provider object.
 */
function _startPlugin (pluginName, _approvedPermissions, sourceCode, ethereumProvider, backgroundApiKeys) {

  console.log(`starting plugin '${pluginName}' in worker`)

  // Object.assign(ethereumProvider, generateBackgroundApi(backgroundApiKeys, approvedPermissions))
  Object.assign(ethereumProvider, generateBackgroundApi(backgroundApiKeys))
  ethereumProvider.registerRpcMessageHandler = (func) => {
    self.pluginRpcHandler = func
  }

  try {

    const compartment = new Compartment({
      self, // Give it the global object for now
      wallet: ethereumProvider,
      console, // Adding console for now for logging purposes.
      BigInt,
      setTimeout,
      crypto,
      SubtleCrypto,
      fetch,
      XMLHttpRequest,
      WebSocket,
      Buffer,
      Date,

      window: {
        crypto,
        SubtleCrypto,
        setTimeout,
        fetch,
        XMLHttpRequest,
        WebSocket,
      },
    })
    compartment.evaluate(sourceCode)
  } catch (err) {
    // _removePlugin(pluginName) // TODO:WW
    console.error(`Error while running plugin '${pluginName}' in worker:${self.name}.`, err)
  }

  // _setPluginToActive(pluginName) // TODO:WW
}

function generateBackgroundApi (backgroundApiKeys) {
  return backgroundApiKeys.reduce((api, key) => {
    api[key] = self.backgroundApi[key]
    return api
  }, {})
}

function setupMultiplex (connectionStream, streamName) {
  const mux = new ObjectMultiplex()
  pump(
    connectionStream,
    mux,
    connectionStream,
    (err) => {
      if (err) {
        console.error(`${streamName} stream failure, closing worker.`, err)
      }
      self.close()
    }
  )
  return mux
}
