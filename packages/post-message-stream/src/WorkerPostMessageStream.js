const BasePostMessageStream = require('./BasePostMessageStream')
const { DEDICATED_WORKER_NAME } = require('./enums')

/**
 * Worker-side PostMessage stream.
 * Dedicated workers only.
 */
module.exports = class WorkerPostMessageStream extends BasePostMessageStream {

  constructor () {

    super()

    this._name = DEDICATED_WORKER_NAME

    self.onmessage = this._onMessage.bind(this)

    this._handshake()
  }

  // private

  _onMessage (event) {
    const message = event.data

    console.log('WORKER RECEIVED MESSAGE', event)

    // validate message
    if (typeof message !== 'object') return
    if (message.target !== this._name) return
    if (!message.data) return

    this._onData(message.data)
  }

  _postMessage (data) {
    self.postMessage({ data })
  }

  // worker stream lifecycle assumed to be coterminous with global scope
  _destroy () {
    return undefined
  }
}
