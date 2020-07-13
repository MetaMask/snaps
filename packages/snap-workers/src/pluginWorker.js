const Dnode = require('dnode')
// const { ethErrors, serializeError } = require('eth-json-rpc-errors')
const { MetamaskInpageProvider } = require('@metamask/inpage-provider')
const ObjectMultiplex = require('obj-multiplex')
const pump = require('pump')
const SES = require('ses')
const { WorkerPostMessageStream } = require('post-message-stream')
const { PLUGIN_STREAM_NAMES } = require('./enums')

init()

async function init () {

  self.backgroundApi = null
  self.rpcStream = null
  self.command = null

  self.plugins = new Map()

  // self.rootRealm = SES.makeSESRootRealm({
  //   consoleMode: 'allow',
  //   errorStackMode: 'allow',
  //   mathRandomMode: 'allow',
  // })

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
      self.backgroundApi = metamaskConnection
      resolve()
    })
  })
}

function _onCommandMessage (message) {

  console.log('COMMAND MESSAGE', message)

  if (typeof message !== 'object') {
    console.error('Command stream received non-object message.')
    return
  }

  const { command, data } = message

  switch (command) {

    case 'installPlugin':
      installPlugin(data)
        .then(() => {
          self.command.write({ response: 'OK' })
        })
        .catch((error) => {
          self.command.write({ response: 'FAILURE', error: error.message })
        })

      break

    case 'ping':
      self.command.write({ response: 'OK' })
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
 * @param {string} sourceCode - The source code of the plugin.
 * @param {Object} ethereumProvider - The plugin's Ethereum provider object.
 */
function _startPlugin (pluginName, _approvedPermissions, sourceCode, ethereumProvider, backgroundApiKeys) {

  console.log(`starting plugin '${pluginName}' in worker`)

  // Object.assign(ethereumProvider, generateBackgroundApi(backgroundApiKeys, approvedPermissions))
  Object.assign(ethereumProvider, generateBackgroundApi(backgroundApiKeys))

  try {

    const sessedPlugin = self.rootRealm.evaluate(sourceCode, {

      wallet: ethereumProvider,
      console, // Adding console for now for logging purposes.
      BigInt,
      setTimeout,
      crypto,
      SubtleCrypto,
      fetch,
      XMLHttpRequest,
      WebSocket,
      Buffer, // TODO:WW may not be available? we'll see
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
    sessedPlugin()
  } catch (err) {
    // _removePlugin(pluginName)
    console.error(`error encountered trying to run plugin '${pluginName} in worker'`)
  }

  // _setPluginToActive(pluginName)
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
