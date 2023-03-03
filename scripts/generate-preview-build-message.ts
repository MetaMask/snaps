#!yarn ts-node

import execa from 'execa';
import fs from 'fs';
import path from 'path';

/**
 * Write a preview build message to the path "preview-build-message.txt".
 */
async function main() {
  const packageMap: Record<string, string> = {};

  const { stdout } = await execa('yarn', [
    'workspaces',
    'list',
    '--no-private',
    '--json',
  ]);

  const packages = stdout.split('\n').map((line) => JSON.parse(line));
  const packageManifestPaths = packages.map(({ location }) =>
    path.join(location, 'package.json'),
  );

  for (const manifestPath of packageManifestPaths) {
    const rawManifest = await fs.promises.readFile(manifestPath, {
      encoding: 'utf8',
    });
    const { name, version } = JSON.parse(rawManifest);

    packageMap[name] = version;
  }

  const previewBuildMessage = `
Preview builds have been published. [See these instructions](https://github.com/MetaMask/snaps-monorepo/blob/main/README.md#using-packages-in-other-projects-during-developmenttesting) for more information about preview builds.

<details>

<summary>Expand for full list of packages and versions.</summary>


\`\`\`
${JSON.stringify(packageMap, null, 2)}
\`\`\`

</details>
`;

  const messagePath = path.resolve(__dirname, '../preview-build-message.txt');
  await fs.promises.writeFile(messagePath, previewBuildMessage);
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exitCode = 1;
});
