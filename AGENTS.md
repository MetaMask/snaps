# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Stack

- **Yarn 4** for managing the monorepo
- **TypeScript 5** for type-safe code
- **Jest** with **SWC** for unit tests; **Vitest** for browser tests
- **ESLint 9** and **Prettier** for linting and formatting
- **ts-bridge** for building packages (produces both ESM and CJS)
- **LavaMoat** for secure builds of execution environments
- **`@metamask/auto-changelog`** for changelog management

## Package Structure

Packages live in `packages/`. Each package follows this structure:

- `src/` — Source files that get built and published
- `package.json` — Package metadata, dependencies, and scripts
- `CHANGELOG.md` — Historical changes following Keep a Changelog format
- `README.md` — Package documentation
- `jest.config.js` — Jest configuration extending the base config
- `tsconfig.json` — TypeScript config for development/IDE
- `tsconfig.build.json` — TypeScript config for production builds

## Development Workflow

Follow test-driven development when making changes:

1. **Update tests first**: Before modifying implementation, update or write tests that describe the desired behavior. Aim for 100% coverage.
2. **Watch tests fail**: Run tests to verify they fail with the current implementation.
3. **Make tests pass**: Implement changes to make the tests pass.
4. **Run all checks**: Ensure lint, types, tests, and changelog validation all pass.

## Build Commands

```bash
# Install dependencies (requires Node.js 20+ and Yarn 4)
yarn install

# Build all packages
yarn build

# Build a single package
yarn workspace @metamask/snaps-controllers build

# Build execution environments (special LavaMoat build, run after main build)
yarn build:execution-environments
```

## Testing

```bash
# Run all tests across all packages
yarn test

# Run tests for a specific package
yarn workspace @metamask/snaps-controllers test

# Run a single test file within a package (without coverage)
yarn workspace @metamask/snaps-controllers jest --no-coverage src/snaps/SnapController.test.ts

# Run tests in watch mode
yarn workspace @metamask/snaps-controllers test:watch

# Run browser tests (some packages have vitest browser tests)
yarn workspace @metamask/snaps-controllers test:browser
```

## Linting

```bash
# Run all linting
yarn lint

# Fix auto-fixable issues
yarn lint:fix

# Run just ESLint
yarn lint:eslint

# Validate changelogs
yarn changelog:validate
```

## Updating Changelogs

Each consumer-facing change should have a changelog entry. Follow ["Keep a Changelog"](https://keepachangelog.com/):

- Maintain an `## [Unreleased]` section at the top
- Use these categories in order: Added, Changed, Deprecated, Removed, Fixed, Security
- Prefix breaking changes with `**BREAKING:**` and list them first in their category
- Link to PRs: `([#123](link-to-pr))`
- Describe API changes precisely, not just PR titles
- Omit internal/non-consumer-facing changes
- Run `yarn changelog:validate` after updates

## Architecture

This is a Yarn workspaces monorepo for Snaps Platform infrastructure. Key packages:

- **snaps-sdk**: Core library for building Snaps. Provides types, JSX runtime, and APIs that Snap developers use. Foundation dependency for most other packages.

- **snaps-utils**: Shared utilities used across the Snaps ecosystem. Includes manifest validation, permissions handling, and common helpers.

- **snaps-controllers**: Controllers that manage Snap lifecycle within MetaMask. Handles installation, execution, permissions, and state management. Used by MetaMask clients (extension/mobile).

- **snaps-execution-environments**: Sandboxed environments where Snaps run with limited access to globals. Uses SES (Secure EcmaScript) for isolation. Builds special bundles via LavaMoat for security.

- **snaps-rpc-methods**: JSON-RPC method implementations for Snap APIs (e.g., `snap_dialog`, `snap_manageState`).

- **snaps-simulation**: Headless testing framework for Snaps. Powers the Jest preset.

- **snaps-jest**: Jest preset and matchers for end-to-end Snap testing. Uses snaps-simulation under the hood.

- **snaps-cli**: CLI tool for building and serving Snaps during development.

- **create-snap**: Scaffolding tool (`yarn create @metamask/snap`) to bootstrap new Snap projects.

- **snaps-webpack-plugin** / **snaps-rollup-plugin**: Bundler plugins for building Snaps.

## Dependency Graph

```
snaps-sdk (foundation)
    ↓
snaps-utils
    ↓
snaps-rpc-methods
    ↓
snaps-controllers ←── snaps-execution-environments (peer dep)
    ↓
snaps-simulation
    ↓
snaps-jest
```

## Naming Conventions

### File Naming

| Type             | Pattern                  | Example                              |
| ---------------- | ------------------------ | ------------------------------------ |
| Controller class | `PascalCase.ts`          | `SnapController.ts`                  |
| Utility files    | `lowercase.ts`           | `utils.ts`, `validation.ts`          |
| Test files       | `[Name].test.ts`         | `SnapController.test.ts`             |
| Browser tests    | `[Name].test.browser.ts` | `IFrameSnapExecutor.test.browser.ts` |
| JSX tests        | `[Name].test.tsx`        | `SnapController.test.tsx`            |

### Class and Type Naming

| Element          | Pattern                   | Example                                    |
| ---------------- | ------------------------- | ------------------------------------------ |
| Controller       | `[Domain]Controller`      | `SnapController`, `CronjobController`      |
| Abstract service | `Abstract[Domain]Service` | `AbstractExecutionService`                 |
| Executor         | `[Platform]SnapExecutor`  | `IFrameSnapExecutor`, `ThreadSnapExecutor` |
| Struct validator | `[Type]Struct`            | `CronjobSpecificationStruct`               |
| Props type       | `[Component]Props`        | `TextProps`, `ButtonProps`                 |
| Element type     | `[Component]Element`      | `TextElement`, `ButtonElement`             |

### Function Naming

| Purpose       | Pattern              | Example                        |
| ------------- | -------------------- | ------------------------------ |
| Factory       | `get[Type]Object`    | `getPersistedSnapObject()`     |
| Type guard    | `is[Type]`           | `isCronjobSpecification()`     |
| Creator       | `create[Thing]`      | `createSnapComponent()`        |
| Handler       | `on[Action]`         | `onTransaction`, `onSignature` |
| Caveat mapper | `[type]CaveatMapper` | `snapIdsCaveatMapper()`        |

### Test Utilities

| Type           | Pattern                       | Example                                       |
| -------------- | ----------------------------- | --------------------------------------------- |
| Mock constant  | `MOCK_[DESCRIPTOR]`           | `MOCK_SNAP_ID`, `MOCK_ORIGIN`                 |
| Factory helper | `get[Type]Object()`           | `getSnapObject()`, `getPersistedSnapObject()` |
| Directory      | `__mocks__/`, `__fixtures__/` | `__mocks__/fs.ts`                             |

## Domain Vocabulary

### Snap Lifecycle

- **SnapId**: Unique identifier (e.g., `npm:@metamask/example-snap`)
- **SnapStatus**: Lifecycle state (`Stopped`, `Running`, `Crashed`)
- **SnapManifest**: Configuration file (`snap.manifest.json`)
- **TruncatedSnap**: Lightweight snap representation
- **PersistedSnap**: Full snap data for storage

### Permission System

- **Caveat**: Constraint on a permission
- **Endowment**: Capability granted to a snap (e.g., `endowment:network-access`). May grant access to JavaScript globals.
- **Restricted**: JSON-RPC method requiring permission
- **Permitted**: Publicly accessible JSON-RPC method

### Execution

- **ExecutionEnvironment**: Runtime context (iframe, webview, worker)
- **Job**: Execution task with Snap ID, streams, and JSON-RPC engine
- **Endowments**: APIs available in snap context

## Adding New Platform Features

When implementing a new Snaps Platform feature (e.g., a new permission, endowment, or RPC method), include:

1. **An example snap** in `packages/examples/packages/` demonstrating the feature
2. **A test-snaps UI** in `packages/test-snaps/` for manual testing with MetaMask
3. **Simulation support** in `snaps-simulation` and/or `snaps-jest` if needed for the example's E2E tests to pass

New RPC methods, permissions, or platform APIs often require corresponding mock implementations or handlers in the simulation layer before the example snap's tests can function correctly.

### Example Snap Structure

Create a new directory in `packages/examples/packages/<feature-name>/`:

```
packages/examples/packages/<feature-name>/
├── src/
│   ├── index.ts          # Snap entry point with handler exports
│   └── index.test.ts     # Tests using @metamask/snaps-jest
├── snap.manifest.json    # Snap manifest with required permissions
├── package.json          # Package with @metamask/snaps-jest devDependency
└── jest.config.js
```

The example snap should:

- Export the relevant handler (e.g., `onRpcRequest`, `onTransaction`)
- Request only the permissions needed for the feature
- Include tests using `installSnap()` from `@metamask/snaps-jest`

### Test-Snaps Integration

Add a feature directory in `packages/test-snaps/src/features/snaps/<feature-name>/`:

```
packages/test-snaps/src/features/snaps/<feature-name>/
├── constants.ts          # SNAP_ID, SNAP_PORT, VERSION exports
├── index.ts              # Re-exports the React component
└── <FeatureName>.tsx     # React component with UI to test the snap
```

Then:

1. Add the example snap as a `devDependency` in `packages/test-snaps/package.json`
2. Export the feature component from `packages/test-snaps/src/features/snaps/index.ts`

See `packages/examples/packages/multichain-provider/` for a complete example.

## Code Guidelines

### Controllers

- Controller classes should extend `BaseController`
- Controllers must have state; stateless logic belongs in services
- Define public messenger types with actions and events
- Include `:getState` action and `:stateChange` event at minimum
- Constructor takes `messenger` and `state` options

### Exports

- Each package has an `index.ts` that defines all public exports
- Use barrel exports (`export * from './module'`)
- Superstruct validators define both the struct and inferred type together

### General

- Packages use `workspace:^` for internal dependencies
- Build uses `ts-bridge` (not tsc directly) to produce ESM and CJS outputs
- Tests use Jest with SWC for transformation; some packages also have Vitest browser tests
- JSX components use `@metamask/snaps-sdk/jsx` with automatic runtime
- Coverage threshold is 100% by default (some packages override this)
- Workspace package names use `@metamask/` scope (e.g., `@metamask/snaps-controllers`, not the directory name `snaps-controllers`)
- Use uppercase "Snap" (not "snap") in comments and documentation when referring to MetaMask Snaps
