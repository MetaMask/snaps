const { promises: fs } = require('fs');
const path = require('path');
const os = require('os');
const execa = require('execa');
const { sync: rimraf } = require('rimraf');

const TEMPLATE_PATH = 'src/cmds/init/init-template.json';

createInitTemplate().catch((error) => {
  throw error;
});

async function createInitTemplate() {
  const tmpdir = await fs.mkdtemp(path.join(os.tmpdir(), 'snaps-cli-build-'));
  await execa(
    'git',
    ['clone', 'https://github.com/MetaMask/template-snap.git'],
    { cwd: tmpdir },
  );

  const templateRepoPath = path.join(tmpdir, 'template-snap');
  const html = await fs.readFile(path.join(templateRepoPath, 'index.html'));
  const js = await fs.readFile(
    path.join(templateRepoPath, path.normalize('src/index.js')),
  );

  await fs.writeFile(
    TEMPLATE_PATH,
    `${JSON.stringify(
      {
        html: html.toString(),
        source: js.toString().replace(/\r\n/gu, '\n'),
      },
      null,
      2,
    )}\n`,
  );

  try {
    rimraf(tmpdir);
  } catch (error) {
    console.error('Failed to delete temporary directory.', error);
  }
}
