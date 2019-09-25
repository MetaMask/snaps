
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
      // TODO: Just give up on babel, which we may not even need?
      // This creates globals that SES doesn't like
      // .transform('babelify', {
      //   presets: ['@babel/preset-env'],
      // })
      .bundle((err, bundle) => {

        if (err) writeError(err)

        // TODO: minification, probably?
        // const { error, code } = terser.minify(bundle.toString())
        // if (error) {
        //   writeError(error.message, error, dest)
        // }
        // let strData = postProcess(code.toString())

        let strData = postProcess(bundle.toString())


        closeBundleStream(bundleStream, strData)
        .then(() => {
          console.log(`Build success: '${src}' bundled as '${dest}'`)
          resolve(true)
        })
        .catch((err) => writeError(err.message, err, dest))
      })
  })
}

function postProcess (str) {
  str = str.trim()
  str = str.replace(/\.import\(/g, '["import"](')
  // TODO: problem? the below also replaces things of the form "something.eval(stuff)"
  // eval(stuff) => (1, eval)(stuff)
  str = str.replace(/(\b)(eval)(\([^)]*\))/g, '$1(1, eval)$3')
  if (str.length === 0) throw new Error(`Bundled code is empty after postprocessing.`)
  return str
}

async function closeBundleStream (stream, bundleString) {

  if (bundleString.endsWith(';')) bundleString = bundleString.slice(0, -1)
  if (bundleString.startsWith('(') && bundleString.endsWith(')')) {
    bundleString = '() => ' + bundleString
  } else {
    bundleString = '() => (\n' + bundleString + '\n)'
  }

  stream.end(bundleString, (err) => {
    if (err) throw err
  })
}

function createBundleStream (dest) {
  const stream = fs.createWriteStream(dest, {
    autoClose: false,
    encoding: 'utf8',
  })
  stream.on('error', err => {
    writeError(err.message, err, dest)
  })
  return stream
}

function writeError(msg, err, destFilePath) {
  logError('Write error: ' + msg, err)
  try {
    if (destFilePath) fs.unlinkSync(destFilePath)
  } catch (_err) {}
  process.exit(1)
}
