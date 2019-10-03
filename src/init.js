
const fs = require('fs')
const pathUtils = require('path')
const packageInit = require('init-package-json')
// const prompts = require('prompts')

const { logError, logWarning, prompt } = require('./utils')

initHandler().then(res => console.log(res))

async function initHandler (argv) {
  // console.log(`'npm init'`)
  // const package = await asyncPackageInit()
  // console.log(package)
  const package = {}

  if (
    !package.web3Wallet ||
    !package.web3Wallet.bundle ||
    !package.web3Wallet.initialPermissions
  ) {
    package.web3Wallet = await buildWeb3Wallet()
  }
  console.log(package)
}

// TODO
// mkdir and validate: ./dist
// write (and populate): index.html, index.js
// run build

function asyncPackageInit () {
  return new Promise((resolve, _reject) => {
    packageInit(process.cwd(), '', {}, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })
}

async function buildWeb3Wallet () {
  console.log('- begin plugin -\n')

  let port
  try {
    port = await prompt('local server port')
    port = Number.parseInt(port)
    if (!port || port === 0) {
      throw new Error(`Invalid port: ${port}`)
    }
  } catch (e) {
    logError(e)
    port = 8080
  }

  let dist
  try {
    dist = await prompt('output directory')
    dist = dist.trim()
    console.log(dist)
    if (!dist || !dist.match(/^[\w\d_\-\/]+$/)) {
      throw new Error(`Invalid dist: '${dist}': not a directory`)
    }
  } catch (e) {
    logError(e)
    dist = 'dist'
  }

  let outfileName
  try {
    outfileName = await prompt('output file name')
    outfileName = outfileName.trim()
    if (
      !outfileName.endsWith('.js') ||
      !outfileName.slice(-3).match(/^[\w\d_\-]+$/)
    ) {
      throw new Error(`Invalid outfile name: '${outfileName}'`)
    }
  } catch (e) {
    logError(e)
    outfileName = 'bundle.js'
  }

  let initialPermissions
  try {
    initialPermissions = await promisePrompt('initialPermissions', true)
    initialPermissions = initialPermissions.trim().split(' ')
      .reduce((acc, p) => {
        if (typeof p === 'string' && !p.match(/^[\w\d_]+$/)) {
          acc[p] = {}
        } else { logWarning(`Invalid permissions: ${p}`) }
        return acc
      }, {})
  } catch (e) {
    logError(e)
    initialPermissions = {}
  }

  return {
    bundle: {
      local: pathUtils.join(dist, outfileName),
      url: `http://localhost:${port}/${dist}/${outfileName}`
    },
    initialPermissions,
  }
}
