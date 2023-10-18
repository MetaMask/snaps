# RPC Methods

Apart from the execution of snaps itself, the Snaps platform is also a
collection of JSON-RPC method implementations that are available to websites and
snaps, though some are restricted to be snap-exclusive, i.e., only available to
snaps.

The JSON-RPC methods are split into two groups: **restricted** and
**permitted**. All permitted RPC method handlers are included in an exported
middleware called [createSnapsMethodMiddleware]. This middleware should be
included in the JSON-RPC engine stack of the client implementing the Snaps
platform. All of the restricted JSON-RPC methods handlers are exported as
[restrictedMethodPermissionBuilders] and use the permission specification
builder pattern. These permission specifications should be built and included in
the [PermissionController] configuration.

These RPC methods implement both globally available APIs that are required to
use the Snaps platform, e.g., `wallet_requestSnaps` as well as more dangerous
APIs that should only be available to specific snaps with specific permissions,
e.g., `snap_getBip44Entropy`.

[createsnapsmethodmiddleware]: ../../../packages/snaps-rpc-methods/src/permitted/middleware.ts
[restrictedmethodpermissionbuilders]: ../../../packages/snaps-rpc-methods/src/restricted/index.ts
[permissioncontroller]: ../permissions.md
