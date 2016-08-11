const Duplex = require('readable-stream').Duplex
const inherits = require('util').inherits

module.exports = PostMessageStream

inherits(PostMessageStream, Duplex)

function PostMessageStream (opts) {
  Duplex.call(this, {
    objectMode: true,
  })

  this._name = opts.name
  this._target = opts.target
 
  window.addEventListener('message', this._onMessage.bind(this), false)
}

// private

PostMessageStream.prototype._onMessage = function (event) {
  var msg = event.data
 
  // validate message
  if (event.origin !== location.origin) return
  if (typeof msg !== 'object') return
  if (msg.target !== this._name) return
  if (!msg.data) return
 
  // forward message
  try {
    this.push(msg.data)
  } catch (err) {
    this.emit('error', err)
  }
}

// stream plumbing

PostMessageStream.prototype._read = noop

PostMessageStream.prototype._write = function (data, encoding, cb) {
 
  var message = {
    target: this._target,
    data: data,
  }
  window.postMessage(message, location.origin)
  cb()
}

// util

function noop () {}
