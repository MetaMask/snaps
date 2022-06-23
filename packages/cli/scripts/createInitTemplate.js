const { promises: fs } = require('fs');
const path = require('path');
const os = require('os');
const execa = require('execa');
const { sync: rimraf } = require('rimraf');

const TEMPLATE_PATH = 'src/cmds/init/init-template.json';
const GITHUB_REPOSITORY_ROOT = 'https://github.com/MetaMask';
const REPO_TEMPLATE_SNAP = 'template-snap';
const REPO_TEMPLATE_TYPESCRIPT_SNAP = 'template-typescript-snap';

createInitTemplate().catch((error) => {
  throw error;
});

/**
 * Creates the `init-template.json` file used for the `mm-snap init` command.
 * The template is based on the `@metamask/template-snap` snap and
 * `@metamask/template-typescript-snap`.
 */
async function createInitTemplate() {
  const tmpdir = await fs.mkdtemp(path.join(os.tmpdir(), 'snaps-cli-build-'));
  const { html, js } = await getTemplateFromRepository(tmpdir);

  const {
    html: typescriptHtml,
    js: typescriptJs,
    tsconfig,
    icon,
  } = await getTemplateFromRepository(tmpdir, true);

  await fs.writeFile(
    TEMPLATE_PATH,
    `${JSON.stringify(
      {
        html: normalizeLinebreaks(html.toString()),
        source: normalizeLinebreaks(js.toString()),
        typescriptHtml: normalizeLinebreaks(typescriptHtml.toString()),
        typescriptSource: normalizeLinebreaks(typescriptJs.toString()),
        typescriptConfig: normalizeLinebreaks(tsconfig.toString()),
        icon: normalizeLinebreaks(icon.toString()),
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

/**
 * Retrieves required template files from
 * specified repository.
 *
 * @param {string} tmpdir - Temporary directory used for handling template files.
 * @param {boolean} isTypeScript - TypeScript flag to determine source file extension.
 * @returns {object} An object with contents read from a file { html, js, tsconfig?, icon? }.
 */
async function getTemplateFromRepository(tmpdir, isTypeScript = false) {
  const sourceFileExtension = isTypeScript ? 'ts' : 'js';
  const repositoryName = isTypeScript
    ? REPO_TEMPLATE_TYPESCRIPT_SNAP
    : REPO_TEMPLATE_SNAP;

  // Clone the develop branch of the repository
  await execa(
    'git',
    [
      'clone',
      '-b',
      'develop',
      `${GITHUB_REPOSITORY_ROOT}/${repositoryName}.git`,
    ],
    { cwd: tmpdir },
  );

  const templateRepoPath = path.join(tmpdir, repositoryName);
  const html = await fs.readFile(path.join(templateRepoPath, 'index.html'));
  const js = await fs.readFile(
    path.join(
      templateRepoPath,
      path.normalize(`src/index.${sourceFileExtension}`),
    ),
  );

  if (isTypeScript) {
    const tsconfig = await fs.readFile(
      path.join(templateRepoPath, 'tsconfig.json'),
    );
    const icon = await fs.readFile(
      path.join(templateRepoPath, 'images/icon.svg'),
    );
    return { html, js, tsconfig, icon };
  }

  return { html, js };
}
