#!yarn ts-node

import execa from 'execa';

const PRIVATE_WORKSPACES = ['@metamask/snaps-simulator'];

/**
 * The entrypoint to this script.
 */
async function main() {
  const args = process.argv.slice(2);
  const all = args.includes('--all');
  const extraArgs = all ? [] : ['--no-private'];

  const { stdout } = await execa('yarn', [
    'workspaces',
    'list',
    '--json',
    ...extraArgs,
  ]);

  const workspaces = stdout.split('\n').map((line) => JSON.parse(line));
  const childWorkspaceNames = workspaces
    .filter((workspace) => {
      if (PRIVATE_WORKSPACES.includes(workspace.name)) {
        return false;
      }

      if (all) {
        return true;
      }

      return workspace.location !== '.';
    })
    .map((workspace) => workspace.name);

  // eslint-disable-next-line no-console
  console.log(JSON.stringify([...childWorkspaceNames, ...PRIVATE_WORKSPACES]));
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exitCode = 1;
});
