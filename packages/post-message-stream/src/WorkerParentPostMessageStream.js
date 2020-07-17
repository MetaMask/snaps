const BasePostMessageStream = require('./BasePostMessageStream')
const { DEDICATED_WORKER_NAME } = require('./enums')

/**
 * Parent-side Dedicated Worker postMessage stream.
 */
module.exports = class WorkerParentPostMessageStream extends BasePostMessageStream {

  constructor ({
    worker,
  } = {}) {

    super()

    this._target = DEDICATED_WORKER_NAME
    this._worker = worker
    this._worker.onmessage = this._onMessage.bind(this)

    this._handshake()
  }

  // private

  _onMessage (event) {
    const message = event.data

    // validate message
    if (typeof message !== 'object') return
    if (!message.data) return

    this._onData(message.data)
  }

  _postMessage (data) {
    this._worker.postMessage({
      target: this._target,
      data,
    })
  }

  _destroy () {
    this._worker.onmessage = null
    this._worker = null
  }
}
