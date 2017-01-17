# post-message-stream

Sets up a duplex object stream over window.postMessage

```js
var streamA = new PostMessageStream({
  name: 'thing one',
  target: 'thing two',
})

var streamB = new PostMessageStream({
  name: 'thing two',
  target: 'thing one',
})

streamB.on('data', (data) => console.log(data))
streamA.write(chunk)
```

### constructor arguments

```js
var messageStream = new PostMessageStream({

  // required

  // name of stream, used to differentiate
  // when multiple streams are on the same window 
  name: 'source',

  // name of target stream 
  target: 'sink',

  // optional

  // window to send the message to
  // default is `window`
  window: iframe.contentWindow,
  
})
```