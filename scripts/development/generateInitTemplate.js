
const { promises: fs } = require('fs');
const path = require('path');

const EXAMPLE_PATH = 'examples/hello-snaps';
const TEMPLATE_PATH = 'src/initTemplate.json';

const html = await fs.readFile(path.join(EXAMPLE_PATH, 'index.html')).toString();
const js = await fs.readFile(path.join(EXAMPLE_PATH, 'index.js')).toString();

await fs.writeFile(TEMPLATE_PATH, JSON.stringify({
  html,
  js,
}, null, 2));

console.log('success: wrote src/initTemplate.json');
