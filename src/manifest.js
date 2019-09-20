
const fs = require('fs')
const pathUtils = require('path')
const dequal = require('fast-deep-equal')
const isUrl = require('is-url')

const { isFile } = require('./utils')

module.exports = async function manifest (argv) {

  let isValid = true
  let didUpdate = false

  const { dist, ['outfile-name']: outfileName } = argv
  if (!dist) {
    throw new Error(`Invalid params: must provide 'dist'`)
  }

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

    let old = { ...pkg.web3Wallet }

    if (!pkg.web3Wallet) {
      pkg.web3Wallet = {}
    }
    if (!pkg.web3Wallet.bundle) {
      pkg.web3Wallet.bundle = {}
    }

    let { bundle, requiredPermissions } = pkg.web3Wallet
    if (bundle && bundle.local) {
      const bundlePath = pathUtils.join(
        dist, outfileName || 'bundle.js'
      ).toString()
      if (bundle.local !== bundlePath) pkg.web3Wallet.bundle.local = bundlePath
    }

    if (!requiredPermissions) {
      pkg.web3Wallet.requiredPermissions = []
    }
    pkg.web3Wallet.requiredPermissions.sort()

    if (!dequal(old, pkg.web3Wallet)) didUpdate = true
  }

  const existing = Object.keys(pkg)
  const required = [
    'name', 'version', 'description', 'main', 'repository', 'web3Wallet'
  ]
  const missing = required.filter(k => !existing.includes(k))
  if (missing.length > 0) {
    logManifestError(
      `Missing required package.json properties:\n` +
      missing.reduce((acc, curr) => {
        acc += curr + '\n'
        return acc
      }, '')
    )
  }

  const { bundle, requiredPermissions } = pkg.web3Wallet || {}
  if (bundle && bundle.local) {
    if (!(await isFile(bundle.local))) {
      logManifestError(`'bundle.local' does not resolve to a file.`)
    }
  } else {
    logManifestError(`Missing required 'web3Wallet' property 'bundle.local'.`)
  }

  if (bundle.url && !isUrl(bundle.url)) {
    logManifestError(`'bundle.url' does not resolve to a URL.`)
  }

  if (requiredPermissions) {
    if (!Array.isArray(requiredPermissions)) {
      logManifestError(`'web3Wallet' property 'requiredPermissions' must be an array.`)
    } else if (requiredPermissions.length === 0) {
      // TODO:SECURITY permissions must be explicitly requested in production
      // console.log(
      //   `Manifest Warning: 'web3Wallet' property 'requiredPermissions' is empty. ` +
      //   `This probably makes your plugin trivial. Please ensure you list all ` +
      //   `permissions your plugin uses.`
      // )
    }
  } else {
    logManifestError(`Missing required 'web3Wallet' property 'requiredPermissions'.`)
  }

  if (argv.populate && didUpdate) {
    fs.writeFile('package.json', JSON.stringify(pkg, null, 2), (err) => {
      if (err) throw new Error(`Could not write package.json`, err)
      console.log(`Manifest Success: updated '${pkg.name}' package.json!`)
    })
  }

  if (isValid) {
    console.log(`Manifest Success: validated '${pkg.name}' package.json!`)
  } else {
    throw new Error(`Error: package.json validation failed, please see above warnings.`)
  }

  function logManifestError(message, err) {
    isValid = false
    console.error(`Manifest Error: ${message}`)
    if (err && mm_plugin.verbose) console.error(err)
  }
}

// TODO: use this to parse requested permissions from source files?
// May be a nice convenience, but may be hard to make any guarantees about it.
function parseRequestedPermissions (source) {
  let requestedPermissions = source.match(
    /ethereumProvider\.[A-z0-9_\-$]+/g
  )

  if (requestedPermissions) {
    requestedPermissions = requestedPermissions.reduce(
      (acc, current) => ({ ...acc, [current.split('.')[1]]: {} }),
      {}
    )
  }
  return requestedPermissions
}
