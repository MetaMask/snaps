const execa = require('execa');
const { promises: fs } = require('fs');
const path = require('path');

// These magic strings correspond to the README.md file.
const README_HEADING_1 = '## Usage\n\n```text\n';
const README_HEADING_2 = '\n```\n\n## MetaMask Snaps';

main();

/**
 * Updates the usage instructions in the readme per the current output of
 * `mm-snap --help`.
 */
async function main() {
  const binPath = path.join(__dirname, '../dist/cjs/main.js');
  const readmePath = path.join(__dirname, '../README.md');
  const currentReadme = await fs.readFile(readmePath, 'utf8');

  const usage = (await execa('node', [binPath, '--help'])).stdout;

  const beginSlice =
    currentReadme.indexOf(README_HEADING_1) + README_HEADING_1.length;
  const endSlice = currentReadme.indexOf(README_HEADING_2);

  if (beginSlice === -1 || endSlice === -1) {
    throw new Error('Failed to match readme headings.');
  }

  const newReadme = currentReadme
    .substring(0, beginSlice)
    .concat(usage)
    .concat(currentReadme.substring(endSlice));

  await fs.writeFile(readmePath, newReadme, 'utf8');
}
