# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Uncategorized

- fix: Prevent initial connections from being revoked as unused ([#3729](https://github.com/MetaMask/snaps/pull/3729))
- fix: Keep dynamic permissions on update ([#3726](https://github.com/MetaMask/snaps/pull/3726))
- feat: Add NPM proxy support ([#3695](https://github.com/MetaMask/snaps/pull/3695))
- fix: Remove logic for granting CAIP-25 permissions ([#3723](https://github.com/MetaMask/snaps/pull/3723))
- chore: Bump @metamask/permission-controller from 12.0.0 to 12.1.0 ([#3714](https://github.com/MetaMask/snaps/pull/3714))
- chore: Bump @metamask/phishing-controller from 13.1.0 to 15.0.0 ([#3707](https://github.com/MetaMask/snaps/pull/3707))
- chore: Bump vite from 6.3.4 to 6.4.1 in the npm_and_yarn group across 1 directory ([#3633](https://github.com/MetaMask/snaps/pull/3633))

## [16.0.0]

### Changed

- **BREAKING:** Use new `Messenger` from `@metamask/messenger` ([#3611](https://github.com/MetaMask/snaps/pull/3611))
  - Previously, `SnapController`, `CronjobController`, `SnapInsightsController`, `SnapInterfaceController`, `MultichainRouter`, `ExecutionService` and `WebSocketService` accepted a `RestrictedMessenger` instance from `@metamask/base-controller`.
- **BREAKING:** Metadata property `anonymous` renamed to `includeInDebugSnapshot` ([#3611](https://github.com/MetaMask/snaps/pull/3611))
- Bump `@metamask/approval-controller` from `^7.2.0` to `^8.0.0`(([#3611](https://github.com/MetaMask/snaps/pull/3611))
- Bump `@metamask/base-controller` from `^8.4.1` to `^9.0.0`(([#3611](https://github.com/MetaMask/snaps/pull/3611))
- Bump `@metamask/permission-controller` from `^11.0.6` to `^12.0.0`(([#3611](https://github.com/MetaMask/snaps/pull/3611))

## [15.0.2]

### Fixed

- Throw if Snap not installed ([#3666](https://github.com/MetaMask/snaps/pull/3666))

## [15.0.1]

### Fixed

- Stop creating errors before needing to throw ([#3664](https://github.com/MetaMask/snaps/pull/3664))

## [15.0.0]

### Added

- **BREAKING:** Allow updating preinstalled Snaps via the registry ([#3616](https://github.com/MetaMask/snaps/pull/3616))
  - `SnapController:updateBlockedSnaps` has been renamed to `SnapController:updateRegistry`.
- Add two new controller state metadata properties: `includeInStateLogs` and `usedInUi` ([#3632](https://github.com/MetaMask/snaps/pull/3632))

### Changed

- **BREAKING:** Make `SnapInterfaceController:createInterface` and `SnapInterfaceController:updateInterface` actions synchronous ([#3361](https://github.com/MetaMask/snaps/pull/3361))
- **BREAKING:** Remove `useCaip25Permission` feature flag and enable behaviour by default ([#3413](https://github.com/MetaMask/snaps/pull/3413))
- **BREAKING:** Use hash private functions for updating internals ([#3601](https://github.com/MetaMask/snaps/pull/3601))
  - `updateSnap`, `processRequestedSnap` and `authorize` are no longer publicly available functions.
- Move JSON-RPC request inspection outside of the executor ([#3356](https://github.com/MetaMask/snaps/pull/3356))
- Simplify JSON-RPC failure validation ([#3661](https://github.com/MetaMask/snaps/pull/3661))
- Bump MetaMask dependencies ([#3651](https://github.com/MetaMask/snaps/pull/3651), [#3638](https://github.com/MetaMask/snaps/pull/3638), [#3648](https://github.com/MetaMask/snaps/pull/3648), [#3630](https://github.com/MetaMask/snaps/pull/3630), [#3628](https://github.com/MetaMask/snaps/pull/3628), [#3629](https://github.com/MetaMask/snaps/pull/3629), [#3607](https://github.com/MetaMask/snaps/pull/3607), [#3623](https://github.com/MetaMask/snaps/pull/3623), [#3612](https://github.com/MetaMask/snaps/pull/3612))

### Fixed

- Properly roll back `initialConnections` ([#3618](https://github.com/MetaMask/snaps/pull/3618))
- Display a warning instead of an error when Snaps fail to terminate ([#3621](https://github.com/MetaMask/snaps/pull/3621))

## [14.2.2]

### Fixed

- Throw a different error when the NPM registry returns 404 while fetching tarballs ([#3602](https://github.com/MetaMask/snaps/pull/3602))
- Prevent logging multiple errors as the cause when a Snap crashes due to an unhandled error ([#3569](https://github.com/MetaMask/snaps/pull/3569))

## [14.2.1]

### Fixed

- Prevent double scheduling events and ensure long-running events work correctly ([#3561](https://github.com/MetaMask/snaps/pull/3561))
- Emit event when destroying execution environment streams ([#3074](https://github.com/MetaMask/snaps/pull/3074))
- Ignore terminate calls to not executing Snaps ([#3559](https://github.com/MetaMask/snaps/pull/3559))
- Properly stop Snaps when clearing state ([#3552](https://github.com/MetaMask/snaps/pull/3552))

## [14.2.0]

### Added

- Add support for `onActive` and `onInactive` lifecycle hooks ([#3542](https://github.com/MetaMask/snaps/pull/3542))

### Changed

- Bump `@metamask/phishing-controller` from `12.6.0` to `13.1.0` ([#3538](https://github.com/MetaMask/snaps/pull/3538))

### Fixed

- Use custom state manager for cronjob controller ([#3539](https://github.com/MetaMask/snaps/pull/3539))

## [14.1.0]

### Added

- Add support for non-fungible assets to `endowment:assets` ([#3527](https://github.com/MetaMask/snaps/pull/3527))
- Add feature flag to treat local Snaps as preinstalled ([#3523](https://github.com/MetaMask/snaps/pull/3523))

## [14.0.2]

### Fixed

- Clear cronjobs properly for local Snaps ([#3514](https://github.com/MetaMask/snaps/pull/3514))
- Improve error message for cancelled requests when a Snap is stopped ([#3518](https://github.com/MetaMask/snaps/pull/3518))
- Improve execution service error messages ([#3521](https://github.com/MetaMask/snaps/pull/3521))
- Ensure Snap gets half of allocated initialization time ([#3522](https://github.com/MetaMask/snaps/pull/3522))

## [14.0.1]

### Fixed

- Handle scheduled events close to current time gracefully ([#3510](https://github.com/MetaMask/snaps/pull/3510))

## [14.0.0]

### Added

- Add support for `onAssetsMarketData` handler ([#3496](https://github.com/MetaMask/snaps/pull/3496))

### Changed

- **BREAKING:** Move `CronjobController` init to separate function ([#3507](https://github.com/MetaMask/snaps/pull/3507))

## [13.1.1]

### Fixed

- Always delete socket when `close` is emitted ([#3465](https://github.com/MetaMask/snaps/pull/3465))
- Add missing boilerplate to `WebSocketService` ([#3464](https://github.com/MetaMask/snaps/pull/3464))

## [13.1.0]

### Added

- Add `WebSocketService` for WebSockets support ([#3450](https://github.com/MetaMask/snaps/pull/3450))
  - This service must be instantiated to invoke `onWebSocketEvent` when WebSocket
    messages are received.
- Add `SnapController:init` to support `onStart` handler ([#3455](https://github.com/MetaMask/snaps/pull/3455))
  - This function should be called when the client has been fully started.

## [13.0.0]

### Changed

- **BREAKING:** Drop support for Node.js 18 and 21 ([#3447](https://github.com/MetaMask/snaps/pull/3447))
- **BREAKING:** Refactor cronjob controller to reduce duplication ([#3421](https://github.com/MetaMask/snaps/pull/3421))
  - The `jobs` state property was removed in favour of the `events` property,
    which now contains all background events and cronjobs.
  - `CronjobController:schedule` now expects a `schedule` field instead of
    `date`.
  - Some actions were renamed to remove the `BackgroundEvent` suffix:
    - `CronjobController:scheduleBackgroundEvent` ->
      `CronjobController:schedule`.
    - `CronjobController:cancelBackgroundEvent` -> `CronjobController:cancel`.
    - `CronjobController:getBackgroundEvents` -> `CronjobController:get`.

### Fixed

- Log errors that cause a crash ([#3443](https://github.com/MetaMask/snaps/pull/3443))
- Recover from a crash more gracefully ([#3440](https://github.com/MetaMask/snaps/pull/3440))
  - This resolves possible race conditions when sending requests to a Snap
    that is in the process of being stopped.

## [12.3.1]

### Fixed

- Support lifecycle hooks for preinstalled Snaps ([#3426](https://github.com/MetaMask/snaps/pull/3426))

## [12.3.0]

### Added

- Add support for `AccountSelector` component ([#3088](https://github.com/MetaMask/snaps/pull/3088))

### Changed

- Fetch registry files in parallel ([#3416](https://github.com/MetaMask/snaps/pull/3416))

### Fixed

- Prevent scheduling background events less than 1 second in the future ([#3414](https://github.com/MetaMask/snaps/pull/3414))

## [12.2.0]

### Added

- Add `isMinimumPlatformVersion` action ([#3405](https://github.com/MetaMask/snaps/pull/3405))

### Changed

- Pass origin to `SnapKeyring` via `MultichainRouter` ([#3403](https://github.com/MetaMask/snaps/pull/3403))

## [12.1.0]

### Added

- Add support for `wallet_switchEthereumChain` ([#2634](https://github.com/MetaMask/snaps/pull/2634))
- Add support for SIP-31 `onClientRequest` handler ([#3394](https://github.com/MetaMask/snaps/pull/3394))

## [12.0.1]

### Fixed

- Fix wrong event name for `Snap Export Used` ([#3389](https://github.com/MetaMask/snaps/pull/3389))
- Remove undefined parameters in `MultichainRouter` ([#3388](https://github.com/MetaMask/snaps/pull/3388))

## [12.0.0]

### Added

- Add Snap export usage metrics ([#3281](https://github.com/MetaMask/snaps/pull/3281))

### Changed

- Bump `@metamask/post-message-stream` from `9.0.0` to `10.0.0` ([#3322](https://github.com/MetaMask/snaps/pull/3322))
- Bump `@metamask/base-controller` from `8.0.0` to `8.0.1` ([#3365](https://github.com/MetaMask/snaps/pull/3365))

### Removed

- **BREAKING:** Remove web worker execution service ([#3371](https://github.com/MetaMask/snaps/pull/3371))

### Fixed

- Catch cronjob errors during initialization ([#3373](https://github.com/MetaMask/snaps/pull/3373))
- Clear unencrypted Snap state when resetting the client ([#3382](https://github.com/MetaMask/snaps/pull/3382))

## [11.2.3]

### Fixed

- Use more performant function to determine if message is a notification ([#3352](https://github.com/MetaMask/snaps/pull/3352))
- Stop unnecessarily encoding messages in web view executor ([#3347](https://github.com/MetaMask/snaps/pull/3347))

## [11.2.2]

### Fixed

- Increase size of request queue when Snap is starting up ([#3340](https://github.com/MetaMask/snaps/pull/3340))

## [11.2.1]

### Fixed

- Make comparison case sensitive in MultichainRouter ([#3310](https://github.com/MetaMask/snaps/pull/3310))

## [11.2.0]

### Added

- Add support for market data to `onAssetsConversion` handler ([#3299](https://github.com/MetaMask/snaps/pull/3299))
- Add support for `onAssetHistoricalPrice` handler ([#3282](https://github.com/MetaMask/snaps/pull/3282))

### Changed

- Debounce persistence of state updates ([#3258](https://github.com/MetaMask/snaps/pull/3258))

### Fixed

- Inject `context` into `onUserInput` request ([#3298](https://github.com/MetaMask/snaps/pull/3298))
- Consider protocol Snaps when determining `isSupportedScope` ([#3284](https://github.com/MetaMask/snaps/pull/3284))
- Validate origin in `handleRequest` ([#3292](https://github.com/MetaMask/snaps/pull/3292))
- Update `name` and `symbol` to be optional in a fungible asset type ([#3300](https://github.com/MetaMask/snaps/pull/3300))
- Stop refreshing phishing list when updating interfaces ([#3272](https://github.com/MetaMask/snaps/pull/3272))

## [11.1.0]

### Added

- Add support for the `AddressInput` component ([#3129](https://github.com/MetaMask/snaps/pull/3129))
- Add support for the `AssetSelector` component ([#3166](https://github.com/MetaMask/snaps/pull/3166))
- Add mutex to `getSnapState` to prevent concurrent decryption ([#3234](https://github.com/MetaMask/snaps/pull/3234))

### Changed

- Increase Snap interface context size limit slightly ([#3246](https://github.com/MetaMask/snaps/pull/3246))
- Bump `@metamask/key-tree` from `10.1.0` to `10.1.1` ([#3254](https://github.com/MetaMask/snaps/pull/3254))
- Bump `nanoid` from `3.1.31` to `3.3.10` ([#3228](https://github.com/MetaMask/snaps/pull/3228), [#3255](https://github.com/MetaMask/snaps/pull/3255))

## [11.0.1]

### Fixed

- Handle `withKeyring` breaking change in `MultichainRouter` ([#3238](https://github.com/MetaMask/snaps/pull/3238))

## [11.0.0]

### Changed

- **BREAKING:** Use mnemonic seed for state encryption key derivation ([#3217](https://github.com/MetaMask/snaps/pull/3217))
  - `SnapController` now expects a `getMnemonicSeed` hook that must return the BIP-39 seed for the user's primary mnemonic.

## [10.0.1]

### Changed

- Log unhandled Snap errors ([#3157](https://github.com/MetaMask/snaps/pull/3157))
- Bump `@metamask/phishing-controller` from `12.3.2` to `12.4.0` ([#3171](https://github.com/MetaMask/snaps/pull/3171))

### Fixed

- Improve error messaging ([#3142](https://github.com/MetaMask/snaps/pull/3142))

## [10.0.0]

### Changed

- **BREAKING:** Use a WebView per Snap on mobile ([#3085](https://github.com/MetaMask/snaps/pull/3085))
  - `WebViewExecutionService` now requires `createWebView` and `removeWebView` constructor arguments, `getWebView` is no longer supported.
- **BREAKING:** Encode messages in `WebViewMessageStream` as byte arrays ([#3077](https://github.com/MetaMask/snaps/pull/3077))
  - A version of the Snaps execution environment that supports this encoding is required.
- Bump MetaMask dependencies ([#3091](https://github.com/MetaMask/snaps/pull/3091), [#3092](https://github.com/MetaMask/snaps/pull/3092), [#3084](https://github.com/MetaMask/snaps/pull/3084), [#3083](https://github.com/MetaMask/snaps/pull/3083), [#3082](https://github.com/MetaMask/snaps/pull/3082), [#3050](https://github.com/MetaMask/snaps/pull/3050))

### Fixed

- Recreate JSON-RPC request in `MultichainRouter` ([#3086](https://github.com/MetaMask/snaps/pull/3086))
- Properly pass down execution service constructor args ([#3110](https://github.com/MetaMask/snaps/pull/3110))

## [9.19.1]

### Fixed

- Add `name` and `state` to `ExecutionService` and `MultichainRouter` ([#3058](https://github.com/MetaMask/snaps/pull/3058))
- Allow `null` in the `endowment:assets` handlers return value ([#3056](https://github.com/MetaMask/snaps/pull/3056))
- Rename `ControllerMessenger` to `Messenger` ([#3053](https://github.com/MetaMask/snaps/pull/3053))

## [9.19.0]

### Added

- Add `MultichainRouter` for SIP-26 ([#2875](https://github.com/MetaMask/snaps/pull/2875))
- Add `onProtocolRequest` support for SIP-26 ([#2875](https://github.com/MetaMask/snaps/pull/2875))
- Add `getRunnableSnaps` action to `SnapController` ([#3049](https://github.com/MetaMask/snaps/pull/3049))

### Fixed

- Set name correctly for `SnapController` ([#3052](https://github.com/MetaMask/snaps/pull/3052), [#3054](https://github.com/MetaMask/snaps/pull/3054))

## [9.18.0]

### Added

- Add support for `onAssetsLookup` and `onAssetsConversion` handlers ([#3028](https://github.com/MetaMask/snaps/pull/3028))

## [9.17.0]

### Added

- Added support for non-recurring cronjobs via `snap_scheduleBackgroundEvent` ([#2941](https://github.com/MetaMask/snaps/pull/2941))

### Changed

- Bump MetaMask dependencies ([#2946](https://github.com/MetaMask/snaps/pull/2946), [#3007](https://github.com/MetaMask/snaps/pull/3007), [#2999](https://github.com/MetaMask/snaps/pull/2999), [#3003](https://github.com/MetaMask/snaps/pull/3003), [#2991](https://github.com/MetaMask/snaps/pull/2991), [#2989](https://github.com/MetaMask/snaps/pull/2989))
- Cache snap state in memory for improved performance ([#2980](https://github.com/MetaMask/snaps/pull/2980))

### Fixed

- Stop storing messenger manually in `CronjobController` ([#3006](https://github.com/MetaMask/snaps/pull/3006))

## [9.16.0]

### Added

- Add support for `onSettingsPage` export ([#2911](https://github.com/MetaMask/snaps/pull/2911))

### Fixed

- Use `BigInt` for processing insight chain IDs ([#2935](https://github.com/MetaMask/snaps/pull/2935))

## [9.15.0]

### Added

- Add `clientCryptography` property for specifying custom cryptography functions ([#2909](https://github.com/MetaMask/snaps/pull/2909))

## [9.14.0]

### Added

- Emit `snapInstalled` and `snapUpdated` events for preinstalled Snaps ([#2900](https://github.com/MetaMask/snaps/pull/2900))
  - This indirectly makes preinstalled Snaps trigger cronjobs and lifecycle hooks more reliably.

## [9.13.0]

### Added

- Add interface persistence ([#2856](https://github.com/MetaMask/snaps/pull/2856))

### Changed

- Use `arrayBuffer` for fetching local Snaps ([#2884](https://github.com/MetaMask/snaps/pull/2884))
  - This fixes some incompatiblities with React Native.

## [9.12.0]

### Added

- Add platform version field to manifest ([#2803](https://github.com/MetaMask/snaps/pull/2803))

### Changed

- Bump MetaMask dependencies ([#2853](https://github.com/MetaMask/snaps/pull/2853))

### Fixed

- Stop unnecesarily validating JSON for stored state ([#2845](https://github.com/MetaMask/snaps/pull/2845))
- Reduce unnecessary JSON validation ([#2844](https://github.com/MetaMask/snaps/pull/2844))

## [9.11.1]

### Fixed

- Pass full URLs to `PhishingController` ([#2835](https://github.com/MetaMask/snaps/pull/2835))
- Ignore Snap insight response if transaction or signature has already been signed ([#2825](https://github.com/MetaMask/snaps/pull/2825))

## [9.11.0]

### Changed

- Allow updating interface context ([#2809](https://github.com/MetaMask/snaps/pull/2809))
  - `snap_updateInterface` now accepts a `context` parameter to update the
    context of an interface.

### Removed

- Remove `AccountSelector` component ([#2794](https://github.com/MetaMask/snaps/pull/2794))
  - This is technically a breaking change, but the `AccountSelector` component was never actually implemented, so it
    should not affect any existing code.

## [9.10.0]

### Changed

- Add `AccountSelector` component ([#2764](https://github.com/MetaMask/snaps/pull/2764), [#2768](https://github.com/MetaMask/snaps/pull/2768), [#2766](https://github.com/MetaMask/snaps/pull/2766))
- Convert `createWindow` parameters to options bag ([#2765](https://github.com/MetaMask/snaps/pull/2765))

## [9.9.0]

### Added

- Add support for `metamask:` schemed URLs ([#2719](https://github.com/MetaMask/snaps/pull/2719))

## [9.8.0]

### Added

- Export `WebViewMessageStream` and related types ([#2746](https://github.com/MetaMask/snaps/pull/2746))

### Fixed

- Fix invalid `exports` field ([#2740](https://github.com/MetaMask/snaps/pull/2740))

## [9.7.0]

### Added

- Add `hideSnapBranding` flag for preinstalled Snaps ([#2713](https://github.com/MetaMask/snaps/pull/2713), [#2717](https://github.com/MetaMask/snaps/pull/2717))

### Fixed

- Fix invalid types in type declaration in some cases ([#2714](https://github.com/MetaMask/snaps/pull/2714))

## [9.6.0]

### Added

- Add `stopAllSnaps` function to `SnapController` ([#2674](https://github.com/MetaMask/snaps/pull/2674))

### Fixed

- Fix ESM version of the package ([#2682](https://github.com/MetaMask/snaps/pull/2682))
  - This fixes the ESM version of the package to be fully compliant with the ESM
    standard.
- Bump `@metamask/utils` from `^9.1.0` to `^9.2.1` ([#2680](https://github.com/MetaMask/snaps/pull/2680))
- Bump other MetaMask dependencies ([#2703](https://github.com/MetaMask/snaps/pull/2703))

## [9.5.0]

### Added

- Add `Selector` component ([#2645](https://github.com/MetaMask/snaps/pull/2645))
- Add missing types for `getState` action & `stateChange` event ([#2655](https://github.com/MetaMask/snaps/pull/2655), [#2659](https://github.com/MetaMask/snaps/pull/2659))

### Fixed

- Fix `fetch` binding under LavaMoat ([#2642](https://github.com/MetaMask/snaps/pull/2642))

## [9.4.0]

### Added

- Add `RadioGroup` component ([#2592](https://github.com/MetaMask/snaps/pull/2592))

### Changed

- Persist `severity` property in `SnapInsightsController` ([#2612](https://github.com/MetaMask/snaps/pull/2612))

## [9.3.1]

### Changed

- Bump `@metamask/approval-controller` from `^7.0.0` to `^7.0.2` ([#2593](https://github.com/metamask/snaps/pull/2593))
- Bump `@metamask/base-controller` from `^6.0.1` to `^6.0.2` ([#2593](https://github.com/metamask/snaps/pull/2593))
- Bump `@metamask/json-rpc-engine` from `^9.0.0` to `^9.0.2` ([#2593](https://github.com/metamask/snaps/pull/2593))
- Bump `@metamask/json-rpc-middleware-stream` from `^8.0.0` to `^8.0.2` ([#2593](https://github.com/metamask/snaps/pull/2593))
- Bump `@metamask/permission-controller` from `^10.0.1` to `^11.0.0` ([#2593](https://github.com/metamask/snaps/pull/2593))
- Bump `@metamask/phishing-controller` from `^10.0.0` to `^10.1.1` ([#2593](https://github.com/metamask/snaps/pull/2593))
- Bump `@metamask/snaps-utils` from `^7.8.0` to `^7.8.1` ([#2595](https://github.com/MetaMask/snaps/pull/2595))

## [9.3.0]

### Added

- Add `snap_resolveInterface` RPC method to the `SnapInterfaceController` ([#2509](https://github.com/metamask/snaps/pull/2509))
- Add `SnapInsightsController` ([#2555](https://github.com/metamask/snaps/pull/2555))

### Changed

- Bump `@metamask/base-controller` from `^6.0.0` to `^6.0.1` ([#2445](https://github.com/MetaMask/snaps/pull/2445))
- Bump `@metamask/permission-controller` from `^10.0.0` to `^10.0.1` ([#2445](https://github.com/MetaMask/snaps/pull/2445))
- Bump `@metamask/rpc-errors` from `^6.2.1` to `^6.3.1` ([#2445](https://github.com/MetaMask/snaps/pull/2445))
- Bump `@metamask/snaps-registry` from `^3.1.0` to `^3.2.1` ([#2445](https://github.com/MetaMask/snaps/pull/2445))
- Bump `@metamask/snaps-rpc-methods` to `^10.0.0` ([#2589](https://github.com/MetaMask/snaps/pull/2589))
- Bump `@metamask/snaps-sdk` to `^6.1.0` ([#2589](https://github.com/MetaMask/snaps/pull/2589))
- Bump `@metamask/snaps-utils` to `^7.8.0` ([#2589](https://github.com/MetaMask/snaps/pull/2589))
- Bump `@metamask/utils` from `^8.3.0` to `^9.1.0` ([#2445](https://github.com/MetaMask/snaps/pull/2445))
- Bump peer dependency `@metamask/snaps-execution-environments` to `^6.6.1` ([#2589](https://github.com/MetaMask/snaps/pull/2589))

### Fixed

- Handle initial connections for preinstalled Snaps ([#2591](https://github.com/MetaMask/snaps/pull/2591))
- Account for revoked origins when calculating the difference in `initialConnections` ([#2535](https://github.com/metamask/snaps/pull/2535))
  - Fixes issue of revoking permissions that are already revoked.
  - Enables revoked connections to be highlighted as being re-added in the UI.
- Enforce stricter size limits for source code, static auxiliary files, and `snap_getFile` return values ([#2527](https://github.com/metamask/snaps/pull/2527))
  - Prevent communication failures by enabling compliance with JSON-RPC extension message requirements.

## [9.2.0]

### Added

- Add feature flag to disable Snap installation ([#2521](https://github.com/MetaMask/snaps/pull/2521))

## [9.1.0]

### Added

- Add `Checkbox` component ([#2501](https://github.com/MetaMask/snaps/pull/2501))
- Add `FileInput` component ([#2469](https://github.com/MetaMask/snaps/pull/2469))
- Support additional components inside forms ([#2497](https://github.com/MetaMask/snaps/pull/2497))

## [9.0.0]

### Changed

- **BREAKING:** Defer creation of offscreen document in `OffscreenExecutionService` ([#2473](https://github.com/MetaMask/snaps/pull/2473))
- Update `onNameLookup` response to include `domainName` ([#2484](https://github.com/MetaMask/snaps/pull/2484))
- Bump MetaMask dependencies ([#2460](https://github.com/MetaMask/snaps/pull/2460))

### Fixed

- Properly decrypt legacy state blobs ([#2472](https://github.com/MetaMask/snaps/pull/2472))

## [8.4.0]

### Added

- Add `hidden` flag for preinstalled Snaps ([#2463](https://github.com/MetaMask/snaps/pull/2463))

### Fixed

- Use first Dropdown option as the default value ([#2465](https://github.com/MetaMask/snaps/pull/2465))

## [8.3.1]

### Fixed

- Fix `react-native` export for tools that don't support `package.json` exports ([#2451](https://github.com/MetaMask/snaps/pull/2451))

## [8.3.0]

### Added

- Add origin to lifecycle hooks ([#2441](https://github.com/MetaMask/snaps/pull/2441))
  - Lifecycle hooks can now use the `origin` parameter to determine the origin
    of the installation or update.

## [8.2.0]

### Added

- Add `context` field to `snap_createInterface` ([#2413](https://github.com/MetaMask/snaps/pull/2413))
- Add feature flag to disable platform ([#2434](https://github.com/MetaMask/snaps/pull/2434))
- Add support for `Dropdown` component ([#2420](https://github.com/MetaMask/snaps/pull/2420))
- Add `initialConnections` diff calculations needed for Snap update ([#2424](https://github.com/MetaMask/snaps/pull/2424))

### Fixed

- Correctly merge caveats when using initial connections ([#2419](https://github.com/MetaMask/snaps/pull/2419))

## [8.1.1]

### Fixed

- Re-instantiate preinstalled Snaps after clearing state ([#2393](https://github.com/MetaMask/snaps/pull/2393))

## [8.1.0]

### Added

- Add JSX support for custom UI ([#2258](https://github.com/MetaMask/snaps/pull/2258))

### Changed

- Bump `@metamask/approval-controller` from `6.0.1` to `6.0.2` ([#2380](https://github.com/MetaMask/snaps/pull/2380))
- Bump `@metamask/base-controller` from `5.0.1` to `5.0.2` ([#2375](https://github.com/MetaMask/snaps/pull/2375))

### Fixed

- Fix an issue where certain types of executors would be timed out too quickly ([#2389](https://github.com/MetaMask/snaps/pull/2389))

## [8.0.0]

### Changed

- **BREAKING:** Move `maxInitTime` constructor argument from `SnapController` to `ExecutionService` ([#2348](https://github.com/MetaMask/snaps/pull/2348))

### Fixed

- Increase max UI size limit from 250 KB to 10 MB ([#2342](https://github.com/MetaMask/snaps/pull/2342))
- Consider caveats in permissions difference calculation ([#2345](https://github.com/MetaMask/snaps/pull/2345))
  - This fixes a bug where certain caveats would not be correctly applied when updating Snaps.
- Gracefully handle errors for multiple simultaneous failing requests ([#2346](https://github.com/MetaMask/snaps/pull/2346))
- Properly handle termination of Snaps that are currently executing ([#2304](https://github.com/MetaMask/snaps/pull/2304))
- Properly tear down partially initialized executors and improve stability when executor initialization fails ([#2348](https://github.com/MetaMask/snaps/pull/2348))

## [7.0.1]

### Fixed

- Fix encryption key caching issues ([#2326](https://github.com/MetaMask/snaps/pull/2326))

## [7.0.0]

### Changed

- **BREAKING:** Refactor encryption to enable caching ([#2316](https://github.com/MetaMask/snaps/pull/2316))
  - New required constructor arguments `encryptor` and `getMnemonic` have been added.
- Include `initialConnections` in approval `requestState` ([#2322](https://github.com/MetaMask/snaps/pull/2322))

### Fixed

- Delete unencrypted state when uninstalling a Snap ([#2311](https://github.com/MetaMask/snaps/pull/2311))

## [6.0.4]

### Changed

- Bump MetaMask dependencies ([#2270](https://github.com/MetaMask/snaps/pull/2270))

## [6.0.3]

### Changed

- Handle unavailable registry more gracefully ([#2256](https://github.com/MetaMask/snaps/pull/2256))
- Bump `@metamask/snaps-registry` to `^3.0.1` ([#2255](https://github.com/MetaMask/snaps/pull/2255))
- Bump `@metamask/json-rpc-engine` to `^7.3.3` ([#2247](https://github.com/MetaMask/snaps/pull/2247))

## [6.0.2]

### Changed

- Improve timeout handling when the execution environment fails to load ([#2242](https://github.com/MetaMask/snaps/pull/2242))

## [6.0.1]

### Fixed

- Fix minor build configuration problems ([#2220](https://github.com/MetaMask/snaps/pull/2220))

## [6.0.0]

### Changed

- **BREAKING:** Update ESM build to be fully compliant with the ESM standard ([#2210](https://github.com/MetaMask/snaps/pull/2210))
- **BREAKING:** Move Node.js exports to separate export ([#2210](https://github.com/MetaMask/snaps/pull/2210))
  - The default export is now browser-compatible.
  - Node.js APIs can be imported from `<package>/node`.
- Bump `@metamask/rpc-errors` to `^6.2.1` ([#2209](https://github.com/MetaMask/snaps/pull/2209))

### Fixed

- Add sizing limits for custom UI ([#2199](https://github.com/MetaMask/snaps/pull/2199))

## [5.0.1]

### Fixed

- Fix issue installing non-allowlisted Snaps in allowlist mode ([#2196](https://github.com/MetaMask/snaps/pull/2196))

## [5.0.0]

### Added

- Add support for dynamic user interfaces ([#1465](https://github.com/MetaMask/snaps/pull/1465), [#2126](https://github.com/MetaMask/snaps/pull/2126), [#2144](https://github.com/MetaMask/snaps/pull/2144), [#2152](https://github.com/MetaMask/snaps/pull/2152), [#2143](https://github.com/MetaMask/snaps/pull/2143))
- Add support for Snap defined execution timeouts ([#2098](https://github.com/MetaMask/snaps/pull/2098))
  - A Snap can now define `maxRequestTime` to extend or shorten its execution timeout.
- Add `WebViewExecutionService` for mobile execution ([#2005](https://github.com/MetaMask/snaps/pull/2005))

### Changed

- Loosen allowlist requirements ([#1672](https://github.com/MetaMask/snaps/pull/1672))
  - Snaps with certain permissions can now be installed without being allowlisted.
- Reintroduce `DecompressionStream` for improved installation performance ([#2110](https://github.com/MetaMask/snaps/pull/2110))
- Bump `tar-stream` ([#2116](https://github.com/MetaMask/snaps/pull/2116))
  - This fixes a problem where Snaps would sometimes fail to download from NPM.
- Bump several MetaMask dependencies ([#2129](https://github.com/MetaMask/snaps/pull/2129), [#2132](https://github.com/MetaMask/snaps/pull/2132), [#2130](https://github.com/MetaMask/snaps/pull/2130), [#2139](https://github.com/MetaMask/snaps/pull/2139), [#2142](https://github.com/MetaMask/snaps/pull/2142))
- Pass localized snap name to SubjectMetadataController ([#2157](https://github.com/MetaMask/snaps/pull/2157))

### Removed

- **BREAKING:** Remove endowment permission specifications from this package ([#2155](https://github.com/MetaMask/snaps/pull/2155))
  - They can now be found in `snaps-rpc-methods`.

## [4.1.0]

### Added

- Add support for signature insights ([#2074](https://github.com/MetaMask/snaps/pull/2074))
- Add support for initial connections ([#2048](https://github.com/MetaMask/snaps/pull/2048))
- Add support for preinstalled snaps ([#2008](https://github.com/MetaMask/snaps/pull/2008))
- Add additional install events ([#2087](https://github.com/MetaMask/snaps/pull/2087))

### Changed

- Bump several MetaMask dependencies ([#2086](https://github.com/MetaMask/snaps/pull/2086), [#2100](https://github.com/MetaMask/snaps/pull/2100))

## [4.0.0]

### Changed

- **BREAKING:** Remove `:snapAdded` event ([#2073](https://github.com/MetaMask/snaps/pull/2073))
- **BREAKING:** Remove `:snapRemoved` event ([#2076](https://github.com/MetaMask/snaps/pull/2076))
- Populate subject metadata when snaps are added to state ([#2069](https://github.com/MetaMask/snaps/pull/2069))

## [3.6.0]

### Changed

- Revert usage of `DecompressionStream` ([#2052](https://github.com/MetaMask/snaps/pull/2052))
- Refactor `NpmLocation` class ([#2038](https://github.com/MetaMask/snaps/pull/2038))
  - Most logic is now located in `BaseNpmLocation`, making it easier to extend without duplication.
- Bump several MetaMask dependencies ([#2053](https://github.com/MetaMask/snaps/pull/2053), [#2061](https://github.com/MetaMask/snaps/pull/2061), [#2064](https://github.com/MetaMask/snaps/pull/2064), [#2065](https://github.com/MetaMask/snaps/pull/2065), [#2067](https://github.com/MetaMask/snaps/pull/2067))

### Removed

- Remove support for object-like syntax for cronjobs ([#2057](https://github.com/MetaMask/snaps/pull/2057))
  - Since this never worked in the first place we aren't marking it as breaking.

## [3.5.1]

### Changed

- Improve `SnapController` constructor types ([#2023](https://github.com/MetaMask/snaps/pull/2023))
- Bump `snaps-registry` ([#2020](https://github.com/MetaMask/snaps/pull/2020))

## [3.5.0]

### Changed

- Reduce memory usage by removing source code and state from runtime ([#2009](https://github.com/MetaMask/snaps/pull/2009))
- Improve base64 encoding/decoding speeds ([#1985](https://github.com/MetaMask/snaps/pull/1985))
- Use `DecompressionStream` for NPM fetching when available ([#1971](https://github.com/MetaMask/snaps/pull/1971))
- Bump several MetaMask dependencies ([#1989](https://github.com/MetaMask/snaps/pull/1989), [#1993](https://github.com/MetaMask/snaps/pull/1993), [#1987](https://github.com/MetaMask/snaps/pull/1987), [#1983](https://github.com/MetaMask/snaps/pull/1983))

### Fixed

- Fix idle snap timeout for unused snap ([#2010](https://github.com/MetaMask/snaps/pull/2010))

## [3.4.1]

### Changed

- Bump several MetaMask dependencies ([#1964](https://github.com/MetaMask/snaps/pull/1964), [#1961](https://github.com/MetaMask/snaps/pull/1961))

### Fixed

- Fix a few issues with passing non-JSON-serializable values ([#1974](https://github.com/MetaMask/snaps/pull/1974))

## [3.4.0]

### Changed

- Use `SubtleCrypto` for checksum calculation if available ([#1953](https://github.com/MetaMask/snaps/pull/1953))
  - This reduces the time of the checksum calculation by up to 95% in some
    environments.
- Use `@metamask/snaps-sdk` package ([#1930](https://github.com/MetaMask/snaps/pull/1930), [#1949](https://github.com/MetaMask/snaps/pull/1949))
  - This package replaces the `@metamask/snaps-types` and
  - `@metamask/snaps-ui` packages.

### Fixed

- Fix support for transaction insight Snaps returning `null` ([#1952](https://github.com/MetaMask/snaps/pull/1952))

## [3.3.0]

### Added

- Add manifest localization functionality ([#1889](https://github.com/MetaMask/snaps/pull/1889))
- Add support for unencrypted storage using `snap_manageState` ([#1902](https://github.com/MetaMask/snaps/pull/1902))
- Add `OnHomePage` export ([#1896](https://github.com/MetaMask/snaps/pull/1896))

## [3.2.0]

### Added

- Add support for links in custom UI and notifications ([#1814](https://github.com/MetaMask/snaps/pull/1814))

### Fixed

- Fix an issue where snaps throwing a `SnapError` would be allowed to run for longer than expected ([#1897](https://github.com/MetaMask/snaps/pull/1897))

## [3.1.1]

### Fixed

- Fix a few issues with allowlist version resolving ([#1888](https://github.com/MetaMask/snaps/pull/1888))

## [3.1.0]

### Added

- Add static file API ([#1836](https://github.com/MetaMask/snaps/pull/1836))
  - This adds a `snap_getFile` method, which Snaps can use to load files.
- Add `origin` parameter to `snapInstalled` and `snapUpdated` events ([#1867](https://github.com/MetaMask/snaps/pull/1867))

### Changed

- Improve error handling ([#1841](https://github.com/MetaMask/snaps/pull/1841))
  - Snaps can now throw a `SnapError`, without causing the Snap to crash.
- Bump `tar-stream` from `^2.2.0` to `^3.1.6` ([#1853](https://github.com/MetaMask/snaps/pull/1853))
- Make `snaps-execution-environments` an optional peer dependency ([#1845](https://github.com/MetaMask/snaps/pull/1845))
- Remove snap errors from state ([#1837](https://github.com/MetaMask/snaps/pull/1837))

### Fixed

- Try to match requested versions with an allowlisted version ([#1877](https://github.com/MetaMask/snaps/pull/1877))
- Improve performance when installing snaps with a static version ([#1878](https://github.com/MetaMask/snaps/pull/1878))
- Stop persisting snaps in the installing state ([#1876](https://github.com/MetaMask/snaps/pull/1876))

## [3.0.0]

### Added

- Add keyring export and endowment ([#1787](https://github.com/MetaMask/snaps/pull/1787))
- Add optional `allowedOrigins` field to `endowment:rpc` ([#1822](https://github.com/MetaMask/snaps/pull/1822))
  - This can be used to only accept certain origins in your Snap.

### Changed

- **BREAKING:** Bump minimum Node.js version to `^18.16.0` ([#1741](https://github.com/MetaMask/snaps/pull/1741))

## [2.0.2]

### Added

- Add `SnapController:snapUninstalled` event ([#1800](https://github.com/MetaMask/snaps/pull/1800))

### Fixed

- Fix some issues with SnapController events ([#1800](https://github.com/MetaMask/snaps/pull/1800))
- Fix an issue where cronjobs would continually be executed on init ([#1790](https://github.com/MetaMask/snaps/pull/1790))

## [2.0.1]

### Changed

- Remove deprecated `endowment:long-running` ([#1751](https://github.com/MetaMask/snaps/pull/1751))

## [2.0.0]

### Changed

- Initial stable release from main branch ([#1757](https://github.com/MetaMask/snaps/pull/1757))

## [0.39.0-flask.1]

### Added

- Add `onNameLookup` export ([#1394](https://github.com/MetaMask/snaps/pull/1394))

### Changed

- Remove `pump` ([#1730](https://github.com/MetaMask/snaps/pull/1730))
- Bump `metamask/utils` and `metamask/snaps-registry` ([#1738](https://github.com/MetaMask/snaps/pull/1738))

### Fixed

- Fix cronjob running on disabled snaps ([#1743](https://github.com/MetaMask/snaps/pull/1743))

## [0.38.3-flask.1]

### Changed

- Bump `@metamask/post-message-stream` from 6.1.2 to 7.0.0 ([#1707](https://github.com/MetaMask/snaps/pull/1707), [#1724](https://github.com/MetaMask/snaps/pull/1724))
- Bump `@metamask/utils` and `@metamask/snaps-registry` ([#1694](https://github.com/MetaMask/snaps/pull/1694))

### Fixed

- Fix unpacking zero byte files from NPM ([#1708](https://github.com/MetaMask/snaps/pull/1708))

## [0.38.2-flask.1]

### Fixed

- Remove unused dependencies ([#1680](https://github.com/MetaMask/snaps/pull/1680))

## [0.38.1-flask.1]

### Fixed

- Fix parallel usage of registry ([#1669](https://github.com/MetaMask/snaps/pull/1669))

## [0.38.0-flask.1]

### Added

- Add `onInstall` and `onUpdate` lifecycle hooks ([#1643](https://github.com/MetaMask/snaps/pull/1643))

### Changed

- Make `updateBlockedSnaps` update the registry ([#1625](https://github.com/MetaMask/snaps/pull/1625))
- Move source code and snap state back to controller state ([#1634](https://github.com/MetaMask/snaps/pull/1634))

## [0.37.2-flask.1]

### Changed

- Release package independently ([#1600](https://github.com/MetaMask/snaps/pull/1600))
  - The version of the package no longer needs to match the version of all other
    MetaMask Snaps packages.

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@16.0.0...HEAD
[16.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@15.0.2...@metamask/snaps-controllers@16.0.0
[15.0.2]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@15.0.1...@metamask/snaps-controllers@15.0.2
[15.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@15.0.0...@metamask/snaps-controllers@15.0.1
[15.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@14.2.2...@metamask/snaps-controllers@15.0.0
[14.2.2]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@14.2.1...@metamask/snaps-controllers@14.2.2
[14.2.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@14.2.0...@metamask/snaps-controllers@14.2.1
[14.2.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@14.1.0...@metamask/snaps-controllers@14.2.0
[14.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@14.0.2...@metamask/snaps-controllers@14.1.0
[14.0.2]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@14.0.1...@metamask/snaps-controllers@14.0.2
[14.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@14.0.0...@metamask/snaps-controllers@14.0.1
[14.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@13.1.1...@metamask/snaps-controllers@14.0.0
[13.1.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@13.1.0...@metamask/snaps-controllers@13.1.1
[13.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@13.0.0...@metamask/snaps-controllers@13.1.0
[13.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@12.3.1...@metamask/snaps-controllers@13.0.0
[12.3.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@12.3.0...@metamask/snaps-controllers@12.3.1
[12.3.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@12.2.0...@metamask/snaps-controllers@12.3.0
[12.2.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@12.1.0...@metamask/snaps-controllers@12.2.0
[12.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@12.0.1...@metamask/snaps-controllers@12.1.0
[12.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@12.0.0...@metamask/snaps-controllers@12.0.1
[12.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@11.2.3...@metamask/snaps-controllers@12.0.0
[11.2.3]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@11.2.2...@metamask/snaps-controllers@11.2.3
[11.2.2]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@11.2.1...@metamask/snaps-controllers@11.2.2
[11.2.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@11.2.0...@metamask/snaps-controllers@11.2.1
[11.2.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@11.1.0...@metamask/snaps-controllers@11.2.0
[11.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@11.0.1...@metamask/snaps-controllers@11.1.0
[11.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@11.0.0...@metamask/snaps-controllers@11.0.1
[11.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@10.0.1...@metamask/snaps-controllers@11.0.0
[10.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@10.0.0...@metamask/snaps-controllers@10.0.1
[10.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@9.19.1...@metamask/snaps-controllers@10.0.0
[9.19.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@9.19.0...@metamask/snaps-controllers@9.19.1
[9.19.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@9.18.0...@metamask/snaps-controllers@9.19.0
[9.18.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@9.17.0...@metamask/snaps-controllers@9.18.0
[9.17.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@9.16.0...@metamask/snaps-controllers@9.17.0
[9.16.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@9.15.0...@metamask/snaps-controllers@9.16.0
[9.15.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@9.14.0...@metamask/snaps-controllers@9.15.0
[9.14.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@9.13.0...@metamask/snaps-controllers@9.14.0
[9.13.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@9.12.0...@metamask/snaps-controllers@9.13.0
[9.12.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@9.11.1...@metamask/snaps-controllers@9.12.0
[9.11.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@9.11.0...@metamask/snaps-controllers@9.11.1
[9.11.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@9.10.0...@metamask/snaps-controllers@9.11.0
[9.10.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@9.9.0...@metamask/snaps-controllers@9.10.0
[9.9.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@9.8.0...@metamask/snaps-controllers@9.9.0
[9.8.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@9.7.0...@metamask/snaps-controllers@9.8.0
[9.7.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@9.6.0...@metamask/snaps-controllers@9.7.0
[9.6.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@9.5.0...@metamask/snaps-controllers@9.6.0
[9.5.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@9.4.0...@metamask/snaps-controllers@9.5.0
[9.4.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@9.3.1...@metamask/snaps-controllers@9.4.0
[9.3.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@9.3.0...@metamask/snaps-controllers@9.3.1
[9.3.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@9.2.0...@metamask/snaps-controllers@9.3.0
[9.2.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@9.1.0...@metamask/snaps-controllers@9.2.0
[9.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@9.0.0...@metamask/snaps-controllers@9.1.0
[9.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@8.4.0...@metamask/snaps-controllers@9.0.0
[8.4.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@8.3.1...@metamask/snaps-controllers@8.4.0
[8.3.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@8.3.0...@metamask/snaps-controllers@8.3.1
[8.3.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@8.2.0...@metamask/snaps-controllers@8.3.0
[8.2.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@8.1.1...@metamask/snaps-controllers@8.2.0
[8.1.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@8.1.0...@metamask/snaps-controllers@8.1.1
[8.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@8.0.0...@metamask/snaps-controllers@8.1.0
[8.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@7.0.1...@metamask/snaps-controllers@8.0.0
[7.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@7.0.0...@metamask/snaps-controllers@7.0.1
[7.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@6.0.4...@metamask/snaps-controllers@7.0.0
[6.0.4]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@6.0.3...@metamask/snaps-controllers@6.0.4
[6.0.3]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@6.0.2...@metamask/snaps-controllers@6.0.3
[6.0.2]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@6.0.1...@metamask/snaps-controllers@6.0.2
[6.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@6.0.0...@metamask/snaps-controllers@6.0.1
[6.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@5.0.1...@metamask/snaps-controllers@6.0.0
[5.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@5.0.0...@metamask/snaps-controllers@5.0.1
[5.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@4.1.0...@metamask/snaps-controllers@5.0.0
[4.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@4.0.0...@metamask/snaps-controllers@4.1.0
[4.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@3.6.0...@metamask/snaps-controllers@4.0.0
[3.6.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@3.5.1...@metamask/snaps-controllers@3.6.0
[3.5.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@3.5.0...@metamask/snaps-controllers@3.5.1
[3.5.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@3.4.1...@metamask/snaps-controllers@3.5.0
[3.4.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@3.4.0...@metamask/snaps-controllers@3.4.1
[3.4.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@3.3.0...@metamask/snaps-controllers@3.4.0
[3.3.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@3.2.0...@metamask/snaps-controllers@3.3.0
[3.2.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@3.1.1...@metamask/snaps-controllers@3.2.0
[3.1.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@3.1.0...@metamask/snaps-controllers@3.1.1
[3.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@3.0.0...@metamask/snaps-controllers@3.1.0
[3.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@2.0.2...@metamask/snaps-controllers@3.0.0
[2.0.2]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@2.0.1...@metamask/snaps-controllers@2.0.2
[2.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@2.0.0...@metamask/snaps-controllers@2.0.1
[2.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@0.39.0-flask.1...@metamask/snaps-controllers@2.0.0
[0.39.0-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@0.38.3-flask.1...@metamask/snaps-controllers@0.39.0-flask.1
[0.38.3-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@0.38.2-flask.1...@metamask/snaps-controllers@0.38.3-flask.1
[0.38.2-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@0.38.1-flask.1...@metamask/snaps-controllers@0.38.2-flask.1
[0.38.1-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@0.38.0-flask.1...@metamask/snaps-controllers@0.38.1-flask.1
[0.38.0-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@0.37.2-flask.1...@metamask/snaps-controllers@0.38.0-flask.1
[0.37.2-flask.1]: https://github.com/MetaMask/snaps/releases/tag/@metamask/snaps-controllers@0.37.2-flask.1
