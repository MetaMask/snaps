const init = require('./init');
const build = require('./build');
const evaluate = require('./eval');
const manifest = require('./manifest');
const serve = require('./serve');
const watch = require('./watch');

module.exports = [init, build, evaluate, manifest, serve, watch];
