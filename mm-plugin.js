#!/usr/bin/env node

const fs = require('fs')
const yargs = require('yargs')

const {
  build, manifest, serve, pluginEval, watch
} = require('./src/commands')

const { logError } = require('./src/utils')

// globals

global.mm_plugin = {
  verbose: false,
}

// yargs config and constants

const CONFIG_PATH = '.mm-plugin.json'

const builders = {
  src: {
    describe: 'Source file',
    type: 'string',
    default: 'index.js'
  },
  dist: {
    describe: 'Output directory',
    type: 'string',
    default: 'dist'
  },
  plugin: {
    describe: 'Plugin bundle',
    type: 'string',
    default: 'dist/bundle.js'
  },
  root: {
    describe: 'Server root directory',
    type: 'string',
    default: '.'
  },
  port: {
    describe: 'Server port',
    type: 'number',
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
    default: false,
  },
  populate: {
    alias: 'p',
    describe: 'Update plugin manifest properties of package.json',
    boolean: true,
    default: false,
  },
  eval: {
    alias: 'e',
    describe: `Call 'eval' on plugin bundle to ensure it works`,
    boolean: true,
    default: true,
  }
}

applyConfig()

// application

yargs
  .usage('Usage: $0 [command] [options]')
  .example('$0 index.js out', `\tBuild 'plugin.js' as './out/bundle.js'`)
  .example('$0 index.js out -n plugin.js', `\tBuild 'plugin.js' as './out/plugin.js'`)
  .example('$0 serve out', `\tServe files in './out' on port 8080`)
  .example('$0 serve out 9000', `\tServe files in './out' on port 9000`)
  .example('$0 watch index.js out', `\tRebuild './out/bundle.js' on changes to files in 'index.js' parent and child directories`)
  .command(
    ['$0 [src] [dist]', 'build', 'b'],
    'Build plugin from source',
    yargs => {
      yargs
        .positional('src', builders.src)
        .positional('dist', builders.dist)
        .option('outfile-name', builders.outfile)
        .option('eval', builders.eval)
        .option('manifest', builders.manifest)
        .option('populate', builders.populate)
        .implies('populate', 'manifest')
    },
    argv => build(argv)
  )
  .command(
    ['eval [plugin]', 'e'],
    builders.eval.describe,
    yargs => {
      yargs
        .positional('plugin', builders.plugin)
    },
    argv => pluginEval(argv)
  )
  .command(
    ['manifest [dist]', 'm'],
    builders.manifest.describe,
    yargs => {
      yargs
        .positional('dist', builders.dist)
        .option('populate', builders.populate)
    },
    argv => manifest(argv)
  )
  .command(
    ['serve [root] [port]', 's'],
    'Locally serve plugin file(s)',
    yargs => {
      yargs
        .positional('root', builders.root)
        .positional('port', builders.port)
    },
    argv => serve(argv)
  )
  .command(
    ['watch [src] [dist]', 'w'],
    'Build file(s) on change',
    yargs => {
      yargs
        .positional('src', builders.src)
        .positional('dist', builders.dist)
        .option('outfile-name', builders.outfile)
    },
    argv => watch(argv)
  )
  .option('verbose', {
    alias: 'v',
    boolean: true,
    describe: 'Display original errors'
  })
  .middleware(argv => {
    assignGlobals(argv)
    sanitizeInputs(argv)
  })
  .help()
  .alias('help', 'h')
  .fail((msg, err, _yargs) => {
    console.error(msg || err.message)
    if (err && err.stack && mm_plugin.verbose) console.error(err.stack)
    process.exit(1)
  })
  .argv

// misc

function assignGlobals (argv) {
  mm_plugin.verbose = Boolean(argv.verbose)
}

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
      if (bundle) {
        builders.plugin.default = bundle
        let dist
        if (bundle.indexOf('/') !== -1) {
          dist = bundle.substr(0, bundle.indexOf('/') + 1)
        } else {
          dist = '.'
        }
        builders.dist.default = dist
        builders.root.default = dist
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
  if (cfg.hasOwnProperty('src')) {
    builders.src.default = cfg['src']
  }
  if (cfg.hasOwnProperty('dist')) {
    builders.dist.default = cfg['dist']
    builders.root.default = cfg['dist']
  }
  if (cfg.hasOwnProperty('plugin')) {
    builders.plugin.default = cfg['plugin']
  }
  if (cfg.hasOwnProperty('root')) {
    builders.root.default = cfg['root']
  }
  if (cfg.hasOwnProperty('port')) {
    builders.port.default = cfg['port']
  }
  if (cfg.hasOwnProperty('manifest')) {
    builders.manifest.default = cfg['manifest']
  }
  if (cfg.hasOwnProperty('populate')) {
    builders.populate.default = cfg['populate']
  }
  if (cfg.hasOwnProperty('eval')) {
    builders.eval.default = cfg['eval']
  }
}
