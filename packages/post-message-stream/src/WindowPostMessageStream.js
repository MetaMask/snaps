const { Duplex } = require('stream')

module.exports = class WindowPostMessageStream extends Duplex {

  constructor ({
    name,
    target,
    targetWindow,
  } = {}) {

    super({
      objectMode: true,
    })

    this._name = name
    this._target = target
    this._targetWindow = targetWindow || window
    this._origin = (targetWindow ? '*' : location.origin)

    // initialization flags
    this._init = false
    this._haveSyn = false

    window.addEventListener('message', this._onMessage.bind(this), false)
    // send synchronization message
    this._write('SYN', null, noop)
    this.cork()
  }

  // private

  _onMessage (event) {
    const message = event.data

    // validate message
    if (this._origin !== '*' && event.origin !== this._origin) return
    if (event.source !== this._targetWindow) return
    if (typeof message !== 'object') return
    if (message.target !== this._name) return
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
    this._targetWindow.postMessage({
      target: this._target,
      data,
    }, this._origin)
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
