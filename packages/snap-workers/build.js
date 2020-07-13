const fs = require('fs')
const browserify = require('browserify')

const writeStream = fs.createWriteStream('dist/pluginWorker.js')

// browserify({ debug: true })
browserify({ debug: false })
  .add('src/pluginWorker.js')
  .transform('uglifyify', { global: true })
  // .transform('uglifyify', { global: true, sourceMap: false })
  .bundle()
  .pipe(writeStream)
