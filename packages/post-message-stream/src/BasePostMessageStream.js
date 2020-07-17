const { Duplex } = require('stream')

function noop () {
  return undefined
}

const SYN = 'SYN'
const ACK = 'ACK'

/**
 * Incomplete base implementation for postMessage streams.
 */
module.exports = class BasePostMessageStream extends Duplex {

  constructor () {

    super({
      objectMode: true,
    })

    // initialization flags
    this._init = false
    this._haveSyn = false
  }

  // private

  /**
   * Must be called at end of child constructor to initiate
   * communication with other end.
   */
  _handshake () {
    // send synchronization message
    this._write(SYN, null, noop)
    this.cork()
  }

  _onData (data) {
    if (!this._init) {
      // listen for handshake
      if (data === SYN) {
        this._haveSyn = true
        this._write(ACK, null, noop)
      } else if (data === ACK) {
        this._init = true
        if (!this._haveSyn) {
          this._write(ACK, null, noop)
        }
        this.uncork()
      }
    } else {
      // forward message
      try {
        this.push(data)
      } catch (err) {
        this.emit('error', err)
      }
    }
  }

  /**
   * Child classes must implement this function.
   */
  _postMessage (_data) {
    throw new Error('Not implemented.')
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
