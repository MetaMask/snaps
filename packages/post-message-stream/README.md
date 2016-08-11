### post-message-stream

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