import { promises as fs } from 'fs';
import path from 'path';

const EXAMPLE_PATH = 'examples/hello-snaps';
const TEMPLATE_PATH = 'src/initTemplate.json';

generateInitTemplate();

async function generateInitTemplate() {
  const html = fs.readFile(path.join(EXAMPLE_PATH, 'index.html')).toString();
  const js = fs.readFile(path.join(EXAMPLE_PATH, 'index.js')).toString();

  await fs.writeFile(TEMPLATE_PATH, JSON.stringify({
    html,
    js,
  }, null, 2));

  console.log('success: wrote src/initTemplate.json');
}
