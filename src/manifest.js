
const fs = require('fs')
const pathUtils = require('path')
const dequal = require('fast-deep-equal')
const isUrl = require('is-url')
const deepClone = require('rfdc')({ proto: false, circles: false })

const { isFile, permRequestKeys } = require('./utils')

/**
 * Validates a plugin package.json file.
 * Exits with success message or gathers all errors before throwing at the end.
 */
module.exports = async function manifest (argv) {

  let isInvalid = false
  let hasWarnings = false
  let didUpdate = false

  const { dist, ['outfileName']: outfileName } = argv
  if (!dist) {
    throw new Error(`Invalid params: must provide 'dist'`)
  }

  // read the package.json file
  let pkg
  try {
    pkg = JSON.parse(fs.readFileSync('package.json'))
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error(
        `Manifest error: Could not find package.json. Please ensure that ` +
        `you are running the command in the project root directory.`
      )
    }
    throw new Error(`Could not parse package.json`, err)
  }

  if (!pkg || typeof pkg !== 'object') {
    throw new Error(`Invalid parsed package.json: ${pkg}`)
  }
  
  // attempt to set missing/erroneous properties if commanded
  if (argv.populate) {

    const old = pkg.web3Wallet ? deepClone(pkg.web3Wallet) : {}

    if (!pkg.web3Wallet) {
      pkg.web3Wallet = {}
    }
    if (!pkg.web3Wallet.bundle) {
      pkg.web3Wallet.bundle = {}
    }
    if (!pkg.web3Wallet.initialPermissions) {
      pkg.web3Wallet.initialPermissions = {}
    }

    let { bundle } = pkg.web3Wallet

    const bundlePath = pathUtils.join(
      dist, outfileName || 'bundle.js'
    )
    if (bundle.local !== bundlePath) bundle.local = bundlePath

    // sort web3Wallet object keys
    Object.entries(pkg.web3Wallet).forEach(([k, v]) => {
      if (typeof v === 'object' && !Array.isArray(v)) {
        pkg.web3Wallet[k] = Object.keys(v).sort().reduce(
          (acc, l) => {
            acc[l] = v[l]
            return acc
        }, {})
      }
    })

    if (!dequal(old, pkg.web3Wallet)) didUpdate = true
  }

  // check presence of required and recommended keys
  const existing = Object.keys(pkg)
  const required = [
    'name', 'version', 'description', 'main', 'web3Wallet'
  ]
  const recommended = [ 'repository' ]

  let missing = required.filter(k => !existing.includes(k))
  if (missing.length > 0) {
    logManifestWarning(
      `Missing required package.json properties:\n` +
      missing.reduce((acc, curr) => {
        acc += `\t${curr}\n`
        return acc
      }, '')
    )
  }
  missing = recommended.filter(k => !existing.includes(k))
  if (missing.length > 0) {
    logManifestWarning(
      `Missing recommended package.json properties:\n` +
      missing.reduce((acc, curr) => {
        acc += `\t${curr}\n`
        return acc
      }, '')
    )
  }

  // check web3Wallet properties
  const { bundle, initialPermissions } = pkg.web3Wallet || {}
  if (bundle && bundle.local) {
    if (!(await isFile(bundle.local))) {
      logManifestError(`'bundle.local' does not resolve to a file.`)
    }
  } else {
    logManifestError(`Missing required 'web3Wallet' property 'bundle.local'.`)
  }

  if (!bundle.url) {
    logManifestError(`Missing required 'bundle.url' property.`)
  } else if (!isUrl(bundle.url)) {
    logManifestError(`'bundle.url' does not resolve to a URL.`)
  }

  if (pkg.web3Wallet.hasOwnProperty('initialPermissions')) {
    if (
      typeof initialPermissions !== 'object' ||
      Array.isArray(initialPermissions)
    ) {
      logManifestError(`'web3Wallet' property 'initialPermissions' must be an object if present.`)

    } else if (Object.keys(initialPermissions).length > 0) {

      Object.entries(initialPermissions).forEach(([k, o]) => {
        if (typeof o !== 'object' || Array.isArray(o)) {
          logManifestError(`inital permission '${k}' must be an object`)

        } else {

          Object.keys(o).forEach(_k => {
            if (!permRequestKeys.includes(_k)) {
              logManifestError(`inital permission '${k}' has unrecognized key '${_k}'`)
            }

            if (_k === 'parentCapability' && k !== _k) {
              logManifestError(`inital permissions '${k}' has mismatched 'parentCapability' field '${o[_k]}'`)
            }
          })
        }
      })
    }
  }

  // validation complete, finish work and notify user

  if (argv.populate) {
    try {
      fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n')
      if (didUpdate) console.log(`Manifest: Updated '${pkg.name}' package.json!`)
    } catch (err) {
      throw new Error(`Could not write package.json`, err)
    }
  }

  if (!isInvalid) {
    if (!hasWarnings) {
      console.log(`Manifest Success: Validated '${pkg.name}' package.json!`)
    } else {
      console.log(`Manifest Warning: Validation of '${pkg.name}' package.json completed with warnings. See above.`)
    }
  } else {
    throw new Error(`Manifest Error: package.json validation failed, please see above errors.`)
  }

  function logManifestError(message, err) {
    isInvalid = true
    console.error(`Manifest Error: ${message}`)
    if (err && mm_plugin.verboseErrors) console.error(err)
  }

  function logManifestWarning(message) {
    if (!mm_plugin.suppressWarnings) {
      hasWarnings = true
      console.warn(`Manifest Warning: ${message}`)
    }
  }
}
