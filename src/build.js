
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

        // TODO: minification
        // const { error, code } = terser.minify(bundle.toString())
        // if (error) {
        //   writeError(error.message, error, dest)
        // }
        // let strData = code.toString().trim()

        let strData = bundle.toString().trim()
        if (strData.length === 0) writeError(`Bundled code is empty.`, null, dest)

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

function writeError(msg, err, destFilePath) {
  logError('Write error: ' + msg, err)
  fs.unlinkSync(destFilePath)
  process.exit(1)
}
