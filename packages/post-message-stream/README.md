# post-message-stream

Sets up a duplex object stream over `window.postMessage`, between pages or a Web Worker and its parent window.

## Usage

```javascript
const streamA = new WindowPostMessageStream({
  name: 'thing one',
  target: 'thing two',
})

const streamB = new WindowPostMessageStream({
  name: 'thing two',
  target: 'thing one',
})

streamB.on('data', (data) => console.log(data))
streamA.write(chunk)
```

## Constructor arguments

```javascript
const messageStream = new WindowPostMessageStream({

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
