const fs = require('fs');
const browserify = require('browserify');
const watchify = require('watchify');

let watch = false;
if (process.argv.length > 2) {
  watch = Boolean(process.argv[2]);
}

const browserifyOpts = {
  debug: false,
  entries: ['dist/_PluginWorker.js'],
  plugin: 'tinyify',
};

if (watch) {
  browserifyOpts.cache = {};
  browserifyOpts.packageCache = {};
  browserifyOpts.plugin = [watchify];
}

const b = browserify(browserifyOpts);

if (watch) {
  b.on('update', bundle).on('log', bundleLog);
}

bundle();

function bundle() {
  b.bundle()
    .on('error', console.error)
    .pipe(fs.createWriteStream('dist/PluginWorker.js'));
}

function bundleLog(message) {
  const date = new Date();
  const time = `${display(date.getHours())}:${display(
    date.getMinutes(),
  )}:${display(date.getSeconds())}`;
  console.log(`${time} ${message}`);

  function display(timeNum) {
    return timeNum >= 10 ? timeNum : `0${timeNum}`;
  }
}
