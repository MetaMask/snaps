
const fs = require('fs')
const pathUtils = require('path')

module.exports = {
  isFile,
  isDirectory,
  getOutfilePath,
  logError,
  validateDirPath,
  validateFilePath,
  validateOutfileName
}

// misc utils

function logError(msg, err) {
  console.error(msg)
  if (err && mm_plugin.verbose) console.error(err)
}

/**
 * Gets the complete out file path from the source file path and output
 * directory path. 
 * 
 * @param {string} srcFilePath - The source file path
 * @param {string} outDir - The out file directory
 * @returns {string} - The complete out file path
 */
function getOutfilePath(outDir, outFileName) {
  return pathUtils.join(outDir, outFileName || 'bundle.js')
}

function validateOutfileName(str) { 
  if (!str.endsWith('.js') || str.indexOf('/') !== -1) {
    throw new Error(`Invalid outfile name: ${str}`)
  }
  return true
}

/**
 * Validates paths for building or watching file(s).
 * 
 * @param {object} argv - Argv object from yargs
 * @param {string} argv.src - The src file path
 * @param {string} argv.dist - The destination directory path
 */
async function validateFilePath(fileName) {

  const exists = await isFile(fileName)

  if (!exists) {
    throw new Error(`Invalid params: '${fileName}' is not a file or does not exist.`)
  }

  return true
}

async function validateDirPath(dirName, createDir) {

  const exists = await isDirectory(dirName, createDir)

  if (!exists) {
    throw new Error(`Invalid params: '${dirName}' is not a directory or could not be created.`)
  }

  return true
}

/**
 * Checks whether the given path string resolves to an existing directory, or 
 * if a directory was created.
 * @param {string} p - The path string to check
 * @param {boolean} createDir - Whether to create the directory if it doesn't exist
 * @returns {boolean} - Whether the given path is an existing directory
 */
function isDirectory(p, createDir) {
  return new Promise((resolve, _) => {
    fs.stat(p, (err, stats) => {
      if (err || !stats) {
        if (err.code === 'ENOENT') {
          if (!createDir) return resolve(false)
          try {
            fs.mkdirSync(p)
            return resolve(true)
          } catch (err) {
            logError(`Directory '${p}' could not be created.`, err)
            process.exit(1)
          }
        }
        return resolve(false)
      }
      resolve(stats.isDirectory())
    })
  })
}

/**
 * Checks whether the given path string resolves to an existing file.
 * @param {string} p - The path string to check
 * @returns {boolean} - Whether the given path is an existing file
 */
function isFile(p) {
  return new Promise((resolve, _) => {
    fs.stat(p, (err, stats) => {
      if (err || !stats) {
        return resolve(false)
      }
      resolve(stats.isFile())
    })
  })
}
