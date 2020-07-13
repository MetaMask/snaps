const { Duplex } = require('stream')
const { DEDICATED_WORKER_NAME } = require('./enums')

/**
 * Parent-side Worker PostMessage stream.
 * Dedicated workers only.
 */
module.exports = class WorkerParentPostMessageStream extends Duplex {

  constructor ({
    worker,
  } = {}) {

    super({
      objectMode: true,
    })

    this._target = DEDICATED_WORKER_NAME
    this._worker = worker

    // initialization flags
    this._init = false
    this._haveSyn = false

    this._worker.onmessage = this._onMessage.bind(this)

    // send synchronization message
    this._write('SYN', null, noop)
    this.cork()
  }

  // private

  _onMessage (event) {
    const message = event.data

    // validate message
    if (typeof message !== 'object') return
    if (!message.data) return

    if (!this._init) {
      // listen for handshake
      if (message.data === 'SYN') {
        this._haveSyn = true
        this._write('ACK', null, noop)
      } else if (message.data === 'ACK') {
        this._init = true
        if (!this._haveSyn) {
          this._write('ACK', null, noop)
        }
        this.uncork()
      }
    } else {
      // forward message
      try {
        this.push(message.data)
      } catch (err) {
        this.emit('error', err)
      }
    }
  }

  _postMessage (data) {
    this._worker.postMessage({
      target: this._target,
      data,
    })
  }

  // stream plumbing

  _read () {
    return undefined
  }

  _write (data, _encoding, cb) {
    this._postMessage(data)
    cb()
  }
}

// util

function noop () {}
