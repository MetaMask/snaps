
const fs = require('fs')
const browserify = require('browserify')
// const terser = require('terser')

const { logError } = require('./utils')

module.exports = {
  bundle,
}

/**
 * Builds a plugin bundle JSON file from its JavaScript source.
 * 
 * @param {string} src - The source file path
 * @param {string} dest - The destination file path
 */
function bundle(src, dest) {
  return new Promise((resolve, _reject) => {

    const bundleStream = createBundleStream(dest)

    browserify(src)
      .transform('babelify', {
        presets: ['@babel/preset-env'],
      })
      .bundle((err, bundle) => {

        if (err) writeError(err)

        const strData = postProcess(bundle.toString('utf8'))

        // TODO: minification
        // const { error, code } = terser.minify(bundle.toString())
        // if (error) {
        //   writeError(error.message, error, dest)
        // }
        // const strData = postProcess(code)


        bundleStream.end(strData, (err) => {
          if (err) writeError(err.message, err, dest)
          console.log(`Build success: '${src}' plugin bundled as '${dest}'`)
          resolve(true)
        })
      })
  })
}

function createBundleStream (dest) {
  const bundleStream = fs.createWriteStream(dest, {
    autoClose: false,
    encoding: 'utf8',
  })
  bundleStream.on('error', err => {
    writeError(err.message, err, dest)
  })
  return bundleStream
}

function postProcess(str) {
  str = str.trim()
  str = str.replace(/\.import\(/g, '["import"](')
  str = str.replace(/([^\w]+)eval\(["'`]{1}(require\([^)]*\))["'`]{1}\)/g, '$1$2')
  str = str.replace(/([^\w]+)eval(\([^)]*\))/g, '$1$2')
  if (str.length === 0) throw new Error(`Bundled code is empty after postprocessing.`)
  return str
}

function writeError(msg, err, destFilePath) {
  logError('Write error: ' + msg, err)
  fs.unlinkSync(destFilePath)
  process.exit(1)
}
