const BasePostMessageStream = require('./BasePostMessageStream')
const { DEDICATED_WORKER_NAME } = require('./enums')

/**
 * Worker-side Dedicated Worker postMessage stream.
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

    // validate message
    if (
      (typeof message !== 'object') ||
      (message.target !== this._name) ||
      (!message.data)
    ) {
      return
    }

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
