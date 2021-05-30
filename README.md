# snaps-skunkworks

Private monorepo for experimental snaps dependencies.

## Installation

Run `yarn setup` in the project root directory.
Do **not** run any installation commands in individual workspaces.

If you add a dependency with a lifecycle script, said dependency must be added to the `devDependencies` and `lavamoat.allow-scripts` config of the root `package.json` file.
This is currently the only way to use `@lavamoat/allow-scripts` in monorepos.
