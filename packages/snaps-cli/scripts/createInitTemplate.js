const { promises: fs } = require('fs');
const path = require('path');
const {
  getSnapSourceShasum,
} = require('@metamask/snap-controllers/dist/snaps/utils');

const EXAMPLE_PATH = path.join(
  __dirname,
  '../../../node_modules/@metamask/snap-examples/examples/hello-snaps',
);
const TEMPLATE_PATH = 'src/cmds/init/init-template.json';

createInitTemplate();

async function createInitTemplate() {
  const html = await fs.readFile(path.join(EXAMPLE_PATH, 'index.html'));
  const js = await fs.readFile(
    path.join(EXAMPLE_PATH, path.normalize('src/index.js')),
  );
  const shasum = getSnapSourceShasum(js);

  await fs.writeFile(
    TEMPLATE_PATH,
    `${JSON.stringify(
      {
        html: html.toString(),
        js: {
          source: js.toString(),
          shasum,
        },
      },
      null,
      2,
    )}\n`,
  );
}
