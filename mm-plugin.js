#!/usr/bin/env node

const fs = require('fs')
const yargs = require('yargs')

const {
  build, manifest, serve, pluginEval, watch
} = require('./src/commands')

const { logError } = require('./src/utils')

// globals

global.mm_plugin = {
  // verboseErrors: false,
  // suppressWarnings: false,
}

// yargs config and constants

const CONFIG_PATH = '.mm-plugin.json'

const builders = {
  src: {
    alias: 's',
    describe: 'Source file',
    type: 'string',
    required: true,
    default: 'index.js'
  },
  dist: {
    alias: 'd',
    describe: 'Output directory',
    type: 'string',
    required: true,
    default: 'dist'
  },
  plugin: {
    alias: 'p, b',
    describe: 'Plugin bundle file',
    type: 'string',
    required: true,
    default: 'dist/bundle.js'
  },
  root: {
    alias: 'r',
    describe: 'Server root directory',
    type: 'string',
    required: true,
    default: '.'
  },
  port: {
    alias: 'p',
    describe: 'Server port',
    type: 'number',
    required: true,
    default: 8080
  },
  outfile: {
    alias: 'n',
    describe: 'Output file name',
    type: 'string'
  },
  manifest: {
    alias: 'm',
    describe: 'Validate project package.json as a plugin manifest',
    boolean: true,
    default: true,
  },
  populate: {
    alias: 'p',
    describe: 'Update plugin manifest properties of package.json',
    boolean: true,
    default: true,
  },
  eval: {
    alias: 'e',
    describe: `Call 'eval' on plugin bundle to ensure it works`,
    boolean: true,
    default: true,
  },
  verboseErrors: {
    alias: ['v', 'verbose'],
    boolean: true,
    describe: 'Display original errors',
    default: false,
  },
  suppressWarnings: {
    alias: ['w'],
    boolean: true,
    describe: 'Suppress warnings',
    default: false,
  }
}

applyConfig()

// application

yargs
  .usage('Usage: $0 [command] [options]')
  .example('$0 -s index.js -d out', `\tBuild 'plugin.js' as './out/bundle.js'`)
  .example('$0 -s index.js -d out -n plugin.js', `\tBuild 'plugin.js' as './out/plugin.js'`)
  .example('$0 serve -r out', `\tServe files in './out' on port 8080`)
  .example('$0 serve -r out -p 9000', `\tServe files in './out' on port 9000`)
  .example('$0 watch -s index.js -d out', `\tRebuild './out/bundle.js' on changes to files in 'index.js' parent and child directories`)
  .command(
    ['$0', 'build', 'b'],
    'Build plugin from source',
    yargs => {
      yargs
        .option('src', builders.src)
        .option('dist', builders.dist)
        .option('outfile-name', builders.outfile)
        .option('eval', builders.eval)
        .option('manifest', builders.manifest)
        .option('populate', builders.populate)
        .implies('populate', 'manifest')
    },
    argv => build(argv)
  )
  .command(
    ['eval', 'e'],
    builders.eval.describe,
    yargs => {
      yargs
        .option('plugin', builders.plugin)
    },
    argv => pluginEval(argv)
  )
  .command(
    ['manifest', 'm'],
    builders.manifest.describe,
    yargs => {
      yargs
        .option('dist', builders.dist)
        .option('populate', builders.populate)
    },
    argv => manifest(argv)
  )
  .command(
    ['serve', 's'],
    'Locally serve plugin file(s)',
    yargs => {
      yargs
        .option('root', builders.root)
        .option('port', builders.port)
    },
    argv => serve(argv)
  )
  .command(
    ['watch', 'w'],
    'Build file(s) on change',
    yargs => {
      yargs
        .option('src', builders.src)
        .option('dist', builders.dist)
        .option('outfile-name', builders.outfile)
    },
    argv => watch(argv)
  )
  .option('verboseErrors', builders.verboseErrors)
  .option('suppressWarnings', builders.suppressWarnings)
  .middleware(argv => {
    assignGlobals(argv)
    sanitizeInputs(argv)
  })
  .help()
  .alias('help', 'h')
  .fail((msg, err, _yargs) => {
    console.error(msg || err.message)
    if (err && err.stack && mm_plugin.verboseErrors) console.error(err.stack)
    process.exit(1)
  })
  .argv

// misc

function assignGlobals (argv) {
  if (argv.hasOwnProperty('verboseErrors')) {
    mm_plugin.verboseErrors = Boolean(argv.verboseErrors)
  }
  if (argv.hasOwnProperty('suppressWarnings')) {
    mm_plugin.suppressWarnings = Boolean(argv.suppressWarnings)
  }
}

/**
 * Sanitizes inputs. Currently:
 * - normalizes paths
 */
function sanitizeInputs (argv) {
  Object.keys(argv).forEach(key => {
    if (typeof argv[key] === 'string') {
      if (argv[key] === './') {
        argv[key] = '.'
      } else if (argv[key].startsWith('./')) {
        argv[key] = argv[key].substring(2)
      }
    }
  })
}

/**
 * Attempts to read the config file and apply the config to
 * globals.
 */
function applyConfig () {

  // first, attempt to read and apply config from package.json
  let pkg = {}
  try {
    pkg = JSON.parse(fs.readFileSync('package.json'))

    if (pkg.main) {
      builders.src.default = pkg.main
    }

    if (pkg.web3Wallet) {
      const { bundle } = pkg.web3Wallet
      if (bundle && bundle.local) {
        const { local: bundlePath } = bundle
        builders.plugin.default = bundlePath
        let dist
        if (bundlePath.indexOf('/') !== -1) {
          dist = bundlePath.substr(0, bundlePath.indexOf('/') + 1)
        } else {
          dist = '.'
        }
        builders.dist.default = dist
      }
    }
  } catch (err) {
    logError(`Warning: Could not parse package.json`, err)
  }

  // second, attempt to read and apply config from .mm-plugin.json
  let cfg = {}
  try {
    cfg = JSON.parse(fs.readFileSync(CONFIG_PATH))
  } catch (err) {
    if (err.code !== 'ENOENT') {
      logError(`Warning: Could not parse .mm-plugin.json`, err)
      process.exit(1)
    }
  }
  if (!cfg || typeof cfg !== 'object' || Object.keys(cfg).length === 0) return
  Object.keys(cfg).forEach(k => {
    if (k === 'verbose') k = 'verboseErrors' // backwards compatibility
    builders[k].default = cfg[k]
  })
}
