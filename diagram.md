Notes marked with ⚠️ are expanded below.
The columns are organized so that everything inside of the iframe is to the right of the iframe column

```mermaid

sequenceDiagram
  participant d as dApp
  participant mm as MetaMask bg
  participant sc as SnapController
  participant ex as ExecutionService
  participant i as Iframe
  participant exe as Execution Environment
  participant ses as SES Compartment
  participant s as A-Snap

  Note over d,mm: invoke A-Snap with RPC request
  Note over d,mm: permission for the dApp to invoke
  d->>mm: invokeSnap(snapId, request)
  Note over mm: provider engine:<br>permission to call handler check<br>call matching handler

  mm->>sc: handleRequest

  Note over sc: > snap is not running
  sc->>sc: startSnap(snapId, code)
  Note over sc: permissions translated to actual endowments

  sc->>ex: executeSnap<br>(snapId, code, endowments)
  ex->>i: create iframe
  i->exe: environment load
  i-->>ex: _
  exe->>exe: initialization
  ex->>ex: setup: streams, job
  Note over ex,exe: postMessage is set up<br>⚠️ e.source===_targetWindow
  Note over ex, exe: can use command(method, RPC) now
  ex->>exe: await command("ping", …)
  exe-->>ex: OK
  ex->>mm: setupSnapProvider(snapId, stream)
  Note over mm,ex: communication is set up on the stream, <br>⚠️ checked for subjectType and snapId as origin
  mm-->>ex: _
  ex->>exe: await command("executeSnap", A-Snap code)
  exe->>exe: create endowments, module etc.
  exe->>ses: create Compartment
  exe->>exe: this.executeInSnapContext
  exe->>ses: evaluate(A-Snap code)
  ses->>s: execute
  s-->>ses: export RPC handler
  ses-->>exe: _
  exe->>exe: ⚠️ validate and register exports
  exe-->>ex: OK
  ex->>ex: createSnapHooks
  Note over ex: wires up snapRpc to the exported handler
  ex-->>sc: OK

  Note over sc: remember: we received a request<br>it can now be sent to snapRpc

  sc->>ex: handleRpcRequest
  Note over sc,ex: request from dApp is wrapped in<br>another RPC for snap command
  sc->>sc: set up timer
  ex->>exe: handle RPC
  exe->s: handle RPC
  s->>s: do stuff

  Note over exe,s: snap sends an RPC request through<br> the endowed API
  s->>exe: request
  exe->>exe: assert method is wallet_* or snap_*
  Note over exe: asserts defensively, doesn't use<br>method.startsWith
  exe->>mm: RPC request
  Note over mm: provider engine:<br>permission to call handler check<br>call matching handler
  mm-->>exe: RPC response
  exe-->>s: RPC response

  s->>s: do stuff
  
  s-->>exe: Snap response
  exe->>exe: assert returned value is valid JSON
  
  exe-->>ex: Snap response
  ex->>ex: Throw if response is an error
  
  ex-->>sc: Snap response
  sc->>sc: Cancel timer

  sc-->>d: Snap response

```

## Notes

### RPC communication stringify for transport

All RPC requests are stringified in the process of passing them on, so no attacks based on poisoning methods of strings or objects should work affter the request crosses the transport gap. (eg. postMessage)

### postMessage usage in iframe execution

IframeExecutionService sets targetOrigin to `*` and
WindowPostMeassageStream says

```js
if(this._targetOrigin !== '*' ...)
```

So we're disabling the check if origin matches.
But then event.source is compared with this.\_targetWindow, which should do the trick.

- We could look into providing the right origin too

### Snap RPC connection with provider

`subjectType` is being checked before a middleware gets to handle an RPC request. The snap is going through the same permission mechanism in the provider as a dApp would.

PermissionsController is fed the snapId as origin, but the snapId is coming from

TODO: add an e2e test checking if enforcing methods not allowed for a snap works.

createOriginMiddleware.js is always overriding the origin field when it passes it onto the `req` so it's not possible for a snap to put a fake origin in the request and have it be passed onto the permissions check. (getter/setter trickery won't work since the request has been serialized to string before reaching this place.)

### Snap exports

Export validation happens while exports references are being shallow-copied onto what we return as export from snaps. (so it's not vulnerable to using a getter to bypass validations)
