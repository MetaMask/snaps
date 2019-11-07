#!/usr/bin/env node

const fs = require('fs')
const yargs = require('yargs')

const {
  build, init, manifest, snapEval, serve, watch
} = require('./src/commands')

const { CONFIG_PATHS, logWarning } = require('./src/utils')

// globals

global.snaps = {
  verboseErrors: false,
  suppressWarnings: false,
  isWatching: false,
}

// yargs config and constants

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

  bundle: {
    alias: ['plugin', 'p', 'b'],
    describe: 'Snap bundle file',
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
    describe: 'Local server port for testing',
    type: 'number',
    required: true,
    default: 8081
  },

  sourceMaps: {
    alias: 'debug', // backwards compatibility
    describe: 'Whether builds include sourcemaps',
    type: 'boolean',
    default: false,
  },

  outfileName: {
    alias: 'n',
    describe: 'Output file name',
    type: 'string',
    default: 'bundle.js'
  },

  manifest: {
    alias: 'm',
    describe: 'Validate project package.json as a Snap manifest',
    type: 'boolean',
    default: true,
  },

  populate: {
    describe: 'Update Snap manifest properties of package.json',
    type: 'boolean',
    default: true,
  },

  eval: {
    alias: 'e',
    describe: `Attempt to evaluate Snap bundle in SES`,
    type: 'boolean',
    default: true,
  },

  verboseErrors: {
    alias: ['v', 'verbose'],
    type: 'boolean',
    describe: 'Display original errors',
    default: false,
  },

  suppressWarnings: {
    alias: ['w'],
    type: 'boolean',
    describe: 'Suppress warnings',
    default: false,
  }
}

applyConfig()

// application

yargs
  .usage('Usage: $0 <command> [options]')
  .example('$0 init', `\tInitialize Snap package from scratch`)
  .example('$0 build -s index.js -d out', `\tBuild 'index.js' as './out/bundle.js'`)
  .example('$0 build -s index.js -d out -n snap.js', `\tBuild 'index.js' as './out/snap.js'`)
  .example('$0 serve -r out', `\tServe files in './out' on port 8080`)
  .example('$0 serve -r out -p 9000', `\tServe files in './out' on port 9000`)
  .example('$0 watch -s index.js -d out', `\tRebuild './out/bundle.js' on changes to files in 'index.js' parent and child directories`)

  .command(
    ['init', 'i'],
    'Initialize Snap package',
    yargs => {
      yargs
        .option('src', builders.src)
        .option('dist', builders.dist)
        .option('outfileName', builders.outfileName)
        .option('port', builders.port)
    },
    argv => init(argv)
  )

  .command(
    ['build', 'b'],
    'Build Snap from source',
    yargs => {
      yargs
        .option('src', builders.src)
        .option('dist', builders.dist)
        .option('outfileName', builders.outfileName)
        .option('sourceMaps', builders.sourceMaps)
        .option('port', builders.port)
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
        .option('bundle', builders.bundle)
    },
    argv => snapEval(argv)
  )

  .command(
    ['manifest', 'm'],
    builders.manifest.describe,
    yargs => {
      yargs
        .option('dist', builders.dist)
        .option('port', builders.port)
        .option('populate', builders.populate)
    },
    argv => manifest(argv)
  )

  .command(
    ['serve', 's'],
    'Locally serve Snap file(s) for testing',
    yargs => {
      yargs
        .option('root', builders.root)
        .option('port', builders.port)
    },
    argv => serve(argv)
  )

  .command(
    ['watch', 'w'],
    'Build Snap on change',
    yargs => {
      yargs
        .option('src', builders.src)
        .option('dist', builders.dist)
        .option('outfileName', builders.outfileName)
        .option('sourceMaps', builders.sourceMaps)
    },
    argv => watch(argv)
  )

  .option('verboseErrors', builders.verboseErrors)
  .option('suppressWarnings', builders.suppressWarnings)
  .demandCommand(1, 'You must specify at least one command.')
  .strict()
  .middleware(argv => {
    assignGlobals(argv)
    sanitizeInputs(argv)
  })
  .help()
  .alias('help', 'h')
  .fail((msg, err, _yargs) => {
    console.error(msg || err.message)
    if (err && err.stack && snaps.verboseErrors) console.error(err.stack)
    process.exit(1)
  })
  .argv

// misc

function assignGlobals (argv) {
  if (['w', 'watch'].includes(argv._[0])) {
    snaps.isWatching = true
  }
  if (argv.hasOwnProperty('verboseErrors')) {
    snaps.verboseErrors = Boolean(argv.verboseErrors)
  }
  if (argv.hasOwnProperty('suppressWarnings')) {
    snaps.suppressWarnings = Boolean(argv.suppressWarnings)
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
        builders.bundle.default = bundlePath
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
    if (err.code !== 'ENOENT') {
      logWarning(`Warning: Could not parse package.json`, err)
    }
  }

  // second, attempt to read and apply config from config file,
  // which will always be preferred if it exists
  let cfg = {}
  for (configPath of CONFIG_PATHS) {
    try {
      cfg = JSON.parse(fs.readFileSync(configPath))
      break
    } catch (err) {
      if (err.code !== 'ENOENT') {
        logWarning(`Warning: '${configPath}' exists but could not be parsed.`)
      }
    }
  }

  if (
    typeof cfg !== 'object' ||
    Object.keys(cfg).length === 0
  ) { return }

  Object.keys(cfg).forEach(k => {

    // backwards compatibility
    if (k === 'verbose') k = 'verboseErrors'
    else if (k === 'debug') k = 'sourceMaps'

    builders[k].default = cfg[k]
  })
}
