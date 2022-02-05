const { promises: fs } = require('fs');
const path = require('path');
const execa = require('execa');

const README_HEADING_1 = '## Usage\n\n';
const README_HEADING_2 = '\n\n## MetaMask Snaps';

main();

async function main() {
  const binPath = path.join(__dirname, '../dist/main.js');
  const readmePath = path.join(__dirname, '../README.md');
  const currentReadme = await fs.readFile(readmePath, 'utf8');

  const usage = (await execa('node', [binPath, '--help'])).stdout;

  const beginSlice =
    currentReadme.indexOf(README_HEADING_1) + README_HEADING_1.length;
  const endSlice = currentReadme.indexOf(README_HEADING_2);
  const newReadme = currentReadme
    .substring(0, beginSlice)
    .concat('```text\n')
    .concat(usage)
    .concat('\n```')
    .concat(currentReadme.substring(endSlice));

  await fs.writeFile(readmePath, newReadme, 'utf8');
}
