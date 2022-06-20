const { promises: fs } = require('fs');
const path = require('path');
const os = require('os');
const execa = require('execa');
const { sync: rimraf } = require('rimraf');

const TEMPLATE_PATH = 'src/cmds/init/init-template.json';

createInitTemplate().catch((error) => {
  throw error;
});

/**
 * Creates the `init-template.json` file used for the `mm-snap init` command.
 * The template is based on the `@metamask/template-snap` snap.
 */
async function createInitTemplate() {
  const tmpdir = await fs.mkdtemp(path.join(os.tmpdir(), 'snaps-cli-build-'));
  // Clone the develop branch of template-snap
  await execa(
    'git',
    ['clone', '-b', 'develop', 'https://github.com/MetaMask/template-snap.git'],
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
        html: normalizeLinebreaks(html.toString()),
        source: normalizeLinebreaks(js.toString()),
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

/**
 * Replaces all windows CRLF / `\r\n` line breaks with LF / `\n` line breaks.
 * Helps normalize line breaks if this script runs on Windows.
 *
 * @param {string} str - The string whose line breaks to normalize.
 * @returns {string} The string with `\n` line breaks.
 */
function normalizeLinebreaks(str) {
  return str.replace(/\r\n/gu, '\n');
}
