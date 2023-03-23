import { promises as fs } from 'fs';
import { join } from 'path';

import { run, SNAP_DIR } from '../../test-utils';

jest.unmock('fs');

const MANIFEST_PATH = join(SNAP_DIR, 'snap.manifest.json');
const PACKAGE_JSON_PATH = join(SNAP_DIR, 'package.json');

describe('mm-snap manifest', () => {
  let originalManifest: string;
  let originalPackageJsonFile: string;

  beforeEach(async () => {
    originalManifest = await fs.readFile(MANIFEST_PATH, 'utf-8');
    originalPackageJsonFile = await fs.readFile(PACKAGE_JSON_PATH, 'utf-8');
  });

  afterEach(async () => {
    await fs.writeFile(MANIFEST_PATH, originalManifest, 'utf-8');
    await fs.writeFile(PACKAGE_JSON_PATH, originalPackageJsonFile, 'utf-8');
  });

  it.each(['manifest', 'm'])(
    'validates the manifest using "mm-snap %s"',
    async (command) => {
      await run({
        command,
      })
        .wait('stdout', "Watching 'src/' for changes...")
        .wait(
          'stdout',
          "Build success: 'src/index.ts' bundled as 'dist/bundle.js'!",
        )
        .wait('stdout', "Eval Success: evaluated 'dist/bundle.js' in SES!")
        .kill()
        .end();
    },
  );

  it('logs and fixes manifest errors', async () => {
    // Write something to the package.json, so that the manifest doesn't match.
    const packageJson = JSON.parse(originalPackageJsonFile);
    await fs.writeFile(
      PACKAGE_JSON_PATH,
      JSON.stringify(
        {
          ...packageJson,
          repository: {
            ...packageJson.repository,
            url: 'https://example.com',
          },
        },
        null,
        2,
      ),
    );

    await run({
      command: 'manifest',
      options: ['--fix false'],
    })
      .stderr('Manifest Error: The manifest is invalid.')
      .stderr(
        'Manifest Error: "snap.manifest.json" "repository" field does not match the "package.json" "repository" field.',
      )
      .code(1)
      .end();

    await run({
      command: 'manifest',
      options: ['--fix true'],
    })
      .code(0)
      .end();

    const manifest = await fs.readFile(MANIFEST_PATH, 'utf-8').then(JSON.parse);
    expect(manifest.repository.url).toBe('https://example.com');
  });
});
