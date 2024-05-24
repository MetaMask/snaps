# Architecture

## Entity diagram

This entity diagram illustrates the "backend" components of the Snaps system
and how they communicate with each other.

![MetaMask Snaps Architecture](https://github.com/MetaMask/snaps/assets/25517051/4e2ba193-7245-4400-9b29-92b13ccb9cd1)

## Sequence diagram

This sequence diagram illustrates the flow of a request from a dapp to a Snap, and back.

```mermaid
sequenceDiagram
  participant d as Dapp
  participant mm as MetaMask Background
  participant sc as Snap Controller
  participant ex as Execution Service
  participant i as Iframe
  participant exe as Execution Environment
  participant ses as SES Compartment
  participant s as A-Snap
  Note over d,mm: Invoke A-Snap with RPC request
  Note over d,mm: Permission for the dapp to invoke
  d->>mm: invokeSnap(snapId, request)
  Note over mm: Provider engine:<br>Permission to call handler check<br>Call matching handler
  mm->>sc: handleRequest
  Note over sc: > Snap is not running
  sc->>sc: startSnap(snapId, code)
  Note over sc: Permissions translated to actual endowments
  sc->>ex: executeSnap<br>(snapId, code, endowments)
  ex->>i: Create iframe
  i->exe: Load environment
  i-->>ex: _
  exe->>exe: Initialization
  ex->>ex: Set up streams and job
  Note over ex,exe: postMessage is set up<br>⚠️ e.source===_targetWindow
  Note over ex, exe: can use command(method, RPC) now
  ex->>exe: await command("ping", …)
  exe-->>ex: OK
  ex->>mm: setupSnapProvider(snapId, stream)
  Note over mm,ex: Communication is set up on the stream, <br>⚠️ checked for subjectType and snapId as origin
  mm-->>ex: _
  ex->>exe: await command("executeSnap", A-Snap code)
  exe->>exe: Create endowments, module etc.
  exe->>ses: Create Compartment
  exe->>exe: this.executeInSnapContext
  exe->>ses: evaluate(A-Snap code)
  ses->>s: Execute
  s-->>ses: Export RPC handler
  ses-->>exe: _
  exe->>exe: ⚠️ Validate and register exports
  exe-->>ex: OK
  ex->>ex: createSnapHooks
  Note over ex: Wires up snapRpc to the exported handler
  ex-->>sc: OK
  Note over sc: Remember: We received a request.<br>It can now be sent to snapRpc
  sc->>ex: handleRpcRequest
  Note over sc,ex: Request from dapp is wrapped in<br>another RPC for snap command
  sc->>sc: Set up timer
  ex->>exe: Handle RPC
  exe->s: Handle RPC
  s->>s: Do stuff
  Note over exe,s: Snap sends an RPC request through<br> the endowed API
  s->>exe: request
  exe->>exe: Check if method is wallet_* or snap_*
  Note over exe: Asserts defensively, doesn't use<br>method.startsWith
  exe->>mm: RPC request
  Note over mm: Provider engine:<br>Permission to call handler check<br>Call matching handler
  mm-->>exe: RPC response
  exe-->>s: RPC response
  s->>s: Do stuff

  s-->>exe: Snap response
  exe->>exe: Check if returned value is valid JSON

  exe-->>ex: Snap response
  ex->>ex: Throw if response is an error

  ex-->>sc: Snap response
  sc->>sc: Cancel timer
  sc-->>d: Snap response
```
