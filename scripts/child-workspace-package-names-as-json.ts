#!yarn ts-node

import execa from 'execa';

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
    .filter((workspace) => all || workspace.location !== '.')
    .map((workspace) => workspace.name);

  // eslint-disable-next-line no-console
  console.log(JSON.stringify(childWorkspaceNames));
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exitCode = 1;
});
