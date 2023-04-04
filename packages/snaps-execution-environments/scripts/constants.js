const ENTRY_POINTS = {
  iframe: { entryPoint: './src/iframe/index.ts', html: true, node: false },
  offscreen: {
    entryPoint: './src/offscreen/index.ts',
    html: true,
    node: false,
  },
  'node-thread': {
    entryPoint: './src/node-thread/index.ts',
    html: false,
    node: true,
  },
  'node-process': {
    entryPoint: './src/node-process/index.ts',
    html: false,
    node: true,
  },
};
const OUTPUT_PATH = './dist/browserify';
const OUTPUT_HTML = 'index.html';
const OUTPUT_BUNDLE = 'bundle.js';

module.exports = { ENTRY_POINTS, OUTPUT_PATH, OUTPUT_HTML, OUTPUT_BUNDLE };
