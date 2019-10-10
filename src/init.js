
const fs = require('fs')
const pathUtils = require('path')
const packageInit = require('init-package-json')

const template = require('./initTemplate.json')
const {
  CONFIG_PATHS, logError, logWarning, prompt, closePrompt, trimPathString
} = require('./utils')

const CONFIG_PATH = CONFIG_PATHS[0]

module.exports = async function initHandler (argv) {

  console.log('Init: Building plugin manifest\n')

  console.log(`Init: 'npm init'\n`)
  const package = await asyncPackageInit()

  await validateEmptyDir()

  console.log(`\nInit: Set package.json web3Wallet properties\n`)

  const [ _web3Wallet, newArgs ] = await buildWeb3Wallet(argv)
  package.web3Wallet = _web3Wallet

  try {
    fs.writeFileSync('package.json', JSON.stringify(package, null, 2) + '\n')
  } catch (err) {
    logError(`Init Error: Fatal: Failed to write package.json`, err)
    process.exit(1)
  }

  console.log(`\nInit: package.json web3Wallet properties set successfully!`)

  // write main js entry file
  const { main } = package
  newArgs.src = main
  try {
    fs.writeFileSync(main, template.js)
    console.log(`Init: Wrote main entry file '${main}'`)
  } catch (err) {
    logError(`Init Error: Fatal: Failed to write main .js file '${main}'`, err)
    process.exit(1)
  }

  // write index.html 
  try {
    fs.writeFileSync('index.html', template.html.toString()
      .replace(/_PORT_/g, newArgs.port || argv.port))
    console.log(`Init: Wrote 'index.html' file`)
  } catch (err) {
    logError(`Init Error: Fatal: Failed to write index.html file`, err)
    process.exit(1)
  }

  // write config file
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(newArgs, null, 2))
    console.log(`Init: Wrote '${CONFIG_PATH}' config file`)
  } catch (err) {
    logError(`Init Error: Failed to write '${CONFIG_PATH}' file`, err)
  }

  closePrompt()
  return { ...argv, ...newArgs }
}

function asyncPackageInit () {
  return new Promise((resolve, _reject) => {
    packageInit(process.cwd(), '', {}, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })
}

async function buildWeb3Wallet (argv) {

  const { outfileName } = argv
  const defaultPerms = { alert: {} }
  let { port, dist } = argv
  let initialPermissions = defaultPerms

  try {
    const c = await prompt(`Use all default plugin manifest values?`, 'yes')
    if (c && ['y', 'yes'].includes(c.toLowerCase())) {
      console.log('Using default values...')
      try {
        fs.mkdirSync(dist)
      } catch (e) {
        if (e.code !== 'EEXIST') {
          logError(`Error: Could not write default 'dist' '${dist}'. Maybe check your local ${CONFIG_PATH} file?`)
        }
      }
      return endWeb3Wallet()
    }
  } catch (e) {
    logError(`Init Error: Fatal`, e)
    process.exit(1)
  }

  // at this point, prompt the user for all values

  port = await prompt(`local server port:`, port)
  while (true) {
    let err
    try {
      let parsedPort = Number.parseInt(port)
      if (parsedPort && parsedPort > 0) {
        port = parsedPort
        break
      }
    } catch (e) { err = e }
    logError(`Invalid port '${port}, please retry.`, err)
    port = await prompt(`local server port:`)
  }

  dist = await prompt(`output directory:`, dist)
  while (true) {
    try {
      dist = trimPathString(dist)
      fs.mkdirSync(dist)
      break
    } catch (e) {
      if (e.code === 'EEXIST') {
        break
      } else {
        logError(`Could not make directory '${dist}', please retry.`, e)
        dist = await prompt(`output directory:`)
      }
    }
  }

  initialPermissions = await prompt(`initialPermissions: [perm1 perm2 ...] ([alert])`)
  while (true) {
    let err
    try {
      if (!initialPermissions) {
        initialPermissions = defaultPerms
        break
      }

      let splitPermissions = initialPermissions.split(' ')
        .reduce((acc, p) => {
          console.log(p)
          if (typeof p === 'string' && p.match(/^[\w\d_]+$/)) {
            acc[p] = {}
          } else {
            logWarning(`Invalid permissions: ${p}`)
          }
          return acc
        }, {})

      initialPermissions = splitPermissions ? splitPermissions : defaultPerms

      break
    } catch (e) { err = e }
    logError(`Invalid initial permissions '${initialPermissions}', please retry.`, err)
    initialPermissions = await prompt(`initialPermissions:`)
  }

  return endWeb3Wallet()

  function endWeb3Wallet () {
    return [
      {
        bundle: {
          local: pathUtils.join(dist, outfileName),
          // url: `http://localhost:${port}/${dist}/${outfileName}`
          url: (new URL(`/${dist}/${outfileName}`, `http://localhost:${port}`)).toString()
        },
        initialPermissions,
      },
      { port, dist, outfileName }
    ]
  }
}

async function validateEmptyDir () {
  const existing = fs.readdirSync(process.cwd()).filter(item => [
     'index.js', 'index.html', CONFIG_PATH, 'dist'
  ].includes(item.toString()))

  if (existing.length > 0) {
    logWarning(
      `\nInit Warning: Existing files/directories may be overwritten:\n` +
      existing.reduce((acc, curr) => {
        acc += `\t${curr}\n`
        return acc
      }, '')
    )
    const c = await prompt(`Continue?`, 'yes')
    if (c && ['y', 'yes'].includes(c.toLowerCase())) {
      return
    } else {
      console.log(`Init: Exiting...`)
      process.exit(1)
    }
  }
}
