# Snap Controller

The [Snap Controller] is the brain of the MetaMask Snaps platform. It is
responsible for:

- Starting and stopping Snaps.
- Managing permissions.
- Managing Snap state.
- Handling incoming requests from dapps, and routing them to the correct
  Snap (through the [Execution Service]).
- Installing and uninstalling Snaps.
- Checking if Snaps are allowed to be installed (through the [Snaps Registry]).

As such, it is the main entry point for the MetaMask Snaps platform. It is
hooked up to the controller messaging system in the MetaMask extension, so it
can handle requests from other parts of the extension.

The Snap controller uses a state machine to manage the state of the Snaps. The
state machine is implemented using the [XState] library. This allows us to
easily reason about the state of the Snaps.

## Starting and stopping Snaps

The Snap Controller is responsible for starting and stopping Snaps. It does
this by calling the [Execution Service] to execute the Snap code in a
[Execution Environment]. When a Snap is started, stopped, crashed, etc., the
Snap Controller updates the state of the Snap in the state machine.

[snap controller]: ../../../packages/snaps-controllers/src/snaps/SnapController.ts
[execution service]: ./execution-service.md
[execution environment]: ../../../packages/snaps-execution-environments/src/common/BaseSnapExecutor.ts
[xstate]: https://xstate.js.org/
[snaps registry]: ./snaps-registry.md
