# snaps

Everything around [MetaMask Snaps](https://metamask.io/snaps/).

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

### Using packages in other projects during development/testing

When developing changes to packages within this repository that a different project depends upon, you may wish to load those changes into the project and test them locally or in CI before publishing proper releases of those packages. To solve that problem, this repository provides a mechanism to publish "preview" versions of packages to GitHub Package Registry. These versions can then be used in the project like any other version, provided the project is configured to use that registry.

#### As a MetaMask contributor

If you're a MetaMask contributor, you can create these preview versions via draft pull requests:

1. Navigate to your settings within GitHub and [create a classic access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token#creating-a-personal-access-token-classic). Make sure to give this token the `packages:read` scope.
2. Switch to your project locally and add/edit the appropriate file with the following content, filling in the appropriate areas:

   - **Yarn 1 (classic) or NPM**

     Add the following in `.npmrc`

     ```
     @metamask:registry=https://npm.pkg.github.com
     //npm.pkg.github.com/:_authToken=<your personal access token>
     ```

   - **Yarn >= 2 (berry):**

     Add the following in `.yarnrc.yml`

     ```
     npmScopes:
        metamask:
           npmAlwaysAuth: true
           npmAuthToken: ${GITHUB_NPM_TOKEN}
           npmRegistryServer: 'https://npm.pkg.github.com'
     ```

   Make sure not to commit these changes.

3. Go to GitHub and open up a pull request for this repository, then post a comment on the PR with the text `@metamaskbot publish-preview`. (This triggers the `publish-preview` GitHub action.)
4. After a few minutes, you will see a new comment indicating that all packages have been published with the format `<package name>-<commit id>`.
5. Switch back to your project locally and update `package.json` by
   replacing the versions for the packages you've changed in your PR using
   the new version format (e.g. `1.2.3-e2df9b4` instead of `~1.2.3`), then
   run `GITHUB_NPM_TOKEN=your-token yarn install`.

   - It's recommended to use your machine's local keychain to store the
     token, and receive it from there. For example on macOS, you can use:
     ```bash
     GITHUB_NPM_TOKEN=$(security find-generic-password -s 'GitHub NPM Token' -w) yarn install
     ```

6. Repeat steps 3-5 after pushing new changes to your PR to generate and use new preview versions.

#### As an independent contributor

If you're a contributor and you've forked this repository, you can create preview versions for a branch via provided scripts:

1. Navigate to your settings within GitHub and [create a **classic** access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token#creating-a-personal-access-token-classic). Make sure to give this token the `packages:read` scope.
2. Switch to your project locally and add/edit the appropriate file with the following content, filling in the appropriate areas.

   - **Yarn 1 (classic) or NPM:**

     Add the following in `.npmrc`

     ```
     @<your GitHub username>:registry=https://npm.pkg.github.com
     //npm.pkg.github.com/:_authToken=<your personal access token>
     ```

   - **Yarn >= 2 (berry):**

     Add the following in `.yarnrc.yml`

     ```
     npmScopes:
        <your GitHub username>:
           npmAlwaysAuth: true
           npmAuthToken: ${GITHUB_NPM_TOKEN}
           npmRegistryServer: 'https://npm.pkg.github.com'
     ```

   Make sure not to commit these changes.

3. Open the `package.json` for each package that you want to publish and change the scope in the name from `@metamask` to `@<your GitHub username>`.
4. Switch to your fork of this repository locally and run `yarn prepare-preview-builds "$(git rev-parse --short HEAD)" && yarn build && yarn publish-previews` to generate preview versions for all packages based on the current branch and publish them to GitHub Package Registry. Take note of the version that is published; it should look like `1.2.3-e2df9b4` instead of `1.2.3`.
5. Switch back to your project and update `package.json` by replacing the
   versions for all packages you've changed using the version that was
   output in the previous step, then run `GITHUB_NPM_TOKEN=your-token yarn install`.

   - It's recommended to use your machine's local keychain to store the
     token, and receive it from there. For example on macOS, you can use:
     ```bash
     GITHUB_NPM_TOKEN=$(security find-generic-password -s 'GitHub NPM Token' -w) yarn install
     ```

6. If you make any new changes to your project, repeat steps 3-5 to generate and use new preview versions.
7. As changes will have been made to this repository (due to step 4), make sure to clear out those changes after you've completed testing.

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

You need to have both Chrome and Firefox installed globally on your computer to run browser tests.

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
