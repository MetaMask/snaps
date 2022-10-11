# snaps-monorepo

Monorepo for experimental snaps dependencies.

## Contributing

### Installing

Run `yarn install` in the project root directory.
Do **not** run any installation commands in individual workspaces.

If you add a dependency with a lifecycle script, said dependency must be added to the `devDependencies` and `lavamoat.allow-scripts` config of the root `package.json` file.
This is currently the only way to use `@lavamoat/allow-scripts` in monorepos.

### Building

Run `yarn build` to build all packages in correct order.
If you encounter any errors, try `yarn build:clean`, and if that fails, check the TypeScript configuration (see below).

You can also run `yarn build` in a specific package / workspace, although you have to ensure that its dependencies have been built.

Repository-wide watching is currently not possible due to the build processes of some packages.

#### Configuring TypeScript

The TypeScript configuration of this monorepo is brittle, and requires manual maintenance.
It uses TypeScript [project references](https://www.typescriptlang.org/docs/handbook/project-references.html) and `composite` sub-projects (i.e. monorepo package).
In short, the [root `tsconfig.json`](./tsconfig.json) must contain an empty `files` array, and `references` to each interdependent project with a `tsconfig.json` in its root directory.
Meanwhile, every sub-project must explicitly declare the relative paths to its local dependencies via its `references` array.

If building from the monorepo root suddenly starts to fail, check if the errors are referring to monorepo packages, and verify that their `tsconfig.json` files are configured correctly.

Some packages do not require a `tsconfig.json` file.
These packages must be explicitly ignored in the [TypeScript config lint script](./scripts/verify-tsconfig.mjs).
If a package is neither referenced nor ignored, linting will fail.

### Testing and Linting

Run `yarn test` and `yarn lint` in the project root directory, or in a workspace.

### Publishing

1. Run [Create Release Pull Request workflow](https://github.com/MetaMask/snaps-monorepo/actions/workflows/create-release-pr.yml)
2. Checkout the created branch.
3. Update CHANGELOG.md in each package, moving changes to their categories and make them more descriptive.
4. Run `yarn install` in root to update `yarn.lock`.
5. Run `yarn build` in `packages/examples` to update snap manifests
6. Get the PR merged, Publish Release workflow will start on main branch.
7. After the workflow does a dry run, manually approve the deployment in Github Actions tab.

To publish locally from the monorepo root use:

```sh
yarn publish:all --otp=YOUR_NPM_OTP_CODE
```
