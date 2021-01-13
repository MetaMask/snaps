const { parentPort } = require('worker_threads')
const { readFileSync } = require('fs')
const crypto = require('crypto')

require('ses/lockdown')
lockdown({
  mathTaming: 'unsafe',
  errorTaming: 'unsafe',
})

parentPort.on('message', (message) => {

  const { pluginFilePath } = message

  const c = new Compartment(getMockApi())
  // Wrap the IIFE in an arrow function, because mocking the wallet is iffy
  c.evaluate(
    // '() => ' + readFileSync(pluginFilePath, 'utf8')
    readFileSync(pluginFilePath, 'utf8')
  );
  setTimeout(() => process.exit(0), 1000) // Hacky McHack
})

function getMockApi () {
  return {
    console,
    wallet: {
      registerRpcMessageHandler: () => true,
    },
    BigInt,
    setTimeout,
    crypto,
    SubtleCrypto: () => {},
    fetch: () => true,
    XMLHttpRequest: () => true,
    WebSocket: () => true,
    Buffer,
    Date,

    window: {
      crypto,
      SubtleCrypto: () => {},
      fetch: () => true,
      XMLHttpRequest: () => true,
      WebSocket: () => true,
    },
  }
}
