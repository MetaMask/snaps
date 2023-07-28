# Snap Controller

The [Snap Controller] is the brain of the MetaMask Snaps platform. It is
responsible for:

- Starting and stopping snaps.
- Managing permissions.
- Managing snap state.
- Handling incoming requests from dapps, and routing them to the correct
  snap (through the [Execution Service]).
- Installing and uninstalling snaps.
- Checking if snaps are allowed to be installed (through the [Snaps Registry]).

As such, it is the main entry point for the MetaMask Snaps platform. It is
hooked up to the controller messaging system in the MetaMask extension, so it
can handle requests from other parts of the extension.

The snap controller uses a state machine to manage the state of the snaps. The
state machine is implemented using the [XState] library. This allows us to
easily reason about the state of the snaps.

## Starting and stopping snaps

The Snap Controller is responsible for starting and stopping snaps. It does
this by calling the [Execution Service] to execute the snap code in a
[Execution Environment]. When a snap is started, stopped, crashed, etc., the
Snap Controller updates the state of the snap in the state machine.

[snap controller]: ../../../packages/snaps-controllers/src/snaps/SnapController.ts
[execution service]: ./execution-service.md
[execution environment]: ../../../packages/snaps-execution-environments/src/common/BaseSnapExecutor.ts
[xstate]: https://xstate.js.org/
[snaps registry]: ./snaps-registry.md
