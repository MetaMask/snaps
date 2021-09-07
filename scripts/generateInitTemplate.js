const { promises: fs } = require('fs');
const path = require('path');

const EXAMPLE_PATH = 'examples/hello-snaps';
const TEMPLATE_PATH = 'src/cmds/init/initTemplate.json';

generateInitTemplate();

async function generateInitTemplate() {
  const html = await fs.readFile(path.join(EXAMPLE_PATH, 'index.html'));
  const js = await fs.readFile(path.join(EXAMPLE_PATH, 'index.js'));

  await fs.writeFile(
    TEMPLATE_PATH,
    JSON.stringify(
      {
        html: html.toString(),
        js: js.toString(),
      },
      null,
      2,
    ),
  );

  console.log('Success: Wrote src/cmds/init/initTemplate.json');
}
