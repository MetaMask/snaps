#!/usr/bin/env node

const fs = require('fs')
const http = require('http')
const pathUtils = require('path')
const chokidar = require('chokidar')
const yargs = require('yargs')
const serveHandler = require('serve-handler')

// yargs config
const srcBuilder = {
  describe: 'source file or directory',
  type: 'string',
  default: './src'
}

const destBuilder = {
  describe: 'output file or directory',
  type: 'string',
  default: './plugins'
}

const rootBuilder = {
  describe: 'server root directory',
  type: 'string',
  default: './plugins'
}

const portBuilder = {
  describe: 'server port',
  type: 'number',
  default: 8080
}

// globals

const _application = {
  verbose: false,
}

// setup application
yargs
  .usage('Usage: $0 [command] [options]')
  .example('$0 plugin.js ./out', 'build plugin.js as ./out/plugin.json')
  .command(
    ['$0 [src] [dest]', 'build', 'b'],
    'build plugin file(s) from source',
    yargs => {
      yargs
        .positional('src', srcBuilder)
        .positional('dest', destBuilder)
    },
    argv => build(argv)
  )
  .command(
    ['watch [src] [dest]', 'w'],
    'rebuild file(s) on change',
    yargs => {
      yargs
        .positional('src', srcBuilder)
        .positional('dest', destBuilder)
    },
    argv => watch(argv)
  )
  .command(
    ['serve [root] [port]', 's'],
    'locally serve plugin file(s)',
    yargs => {
      yargs
        .positional('root', rootBuilder)
        .positional('port', portBuilder)
    },
    argv => serve(argv)
  )
  .option('verbose', {
    alias: 'v',
    boolean: true,
    describe: 'Display original errors.'
  })
  .middleware(argv => {
    _application.verbose = Boolean(argv.verbose)
  })
  .fail((msg, err, _yargs) => {
    console.error(msg || err.message)
    if (err.stack && _application.verbose) console.error(err.stack)
    process.exit(1)
  })
  .help()
  .argv

// command handlers

/**
 * Builds the given file or all files in the given directory.
 */
function build (argv) {
  // validate and catch
  validatePaths(argv)
  .then((paths) => {
    buildFiles(paths)
  })
  .catch(err => {
    console.error(`Build failed: ${err.message}`)
    if (_application.verbose && err.stack) console.error(err.stack)
    process.exit(1)
  })
}

/**
 * Watches file(s) and builds them on changes.
 */
function watch (argv) {
  validatePaths(argv)
  .then((paths) => {
    watchFiles(paths)
  })
  .catch(err => {
    console.error(`Watch failed: ${err.message}`)
    if (_application.verbose && err.stack) console.error(err.stack)
    process.exit(1)
  })
}

/**
 * Starts a local, static HTTP server on the given port with the given root
 * directory.
 * 
 * @param {object} argv - Argv object from yargs
 * @param {string} argv.root - The root directory path string
 * @param {number} argv.port - The server port
 */
async function serve (argv) {

  const { port, root } = argv

  const isDir = await isDirectory(root)
  if (!isDir) {
    throw new Error (`Invalid params: 'root' must be a directory.`)
  }

  const server = http.createServer(async (req, res) => {
    await serveHandler(req, res, {
      public: root,
    })
  })

  server.listen({ port }, () => {
    console.log(`Server listening on: http://localhost:${port}`)
  })

  server.on('request', (request) => {
    console.log(`Handling incoming request for: ${request.url}`)
  })

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Server error: Port ${port} already in use.`)
    } else {
      if (_application.verbose) console.error(err)
    }
    process.exit(1)
  })
  
  server.on('close', () => {
    console.log('Server closed.')
    process.exit(1)
  })
}

// build utils

/**
 * Builds all files in the given source directory to the given destination
 * directory.
 * 
 * @param {object} pathInfo - Path information object from validatePaths
 */
function buildFiles(pathInfo) {

  const { src, dest } = pathInfo

  if (!src.isDirectory) {
    if (!src.path.endsWith('.js')) {
      throw new Error(`Invalid params: input file must be a '.js' file.`)
    }
    buildFile(src.path, dest.path)
  } else {

    fs.readdir(src.path, { withFileTypes: true }, (err, files) => {

      if (err) throw err
      if (!files || files.length === 0) {
        throw new Error('Invalid directory: Source directory is empty.')
      }

      let hasSourceFiles = false

      files.forEach(file => {
        if (file.isFile() && file.name.endsWith('.js')) {
          hasSourceFiles = true
          buildFile(
            pathUtils.join(src.path, file.name), getOutfilePath(file.name, dest.path)
          )
        }
      })

      if (!hasSourceFiles) throw new Error(
        'Invalid directory: Source directory contains no valid source files.'
      )
    })
  }
}

/**
 * Builds a plugin bundle JSON file from its JavaScript source.
 * 
 * @param {string} src - The source file path
 * @param {string} dest - The destination file path
 */
function buildFile(src, dest) {
  fs.readFile(src, 'utf8', function(err, contents) {

    if (err) {
      console.log(`Build failure: could not read file '${src}'`)
      if (_application.verbose) console.error(err)
      return
    }

    const sourceCode = contents
    let requestedPermissions = contents.match(
      /ethereumProvider\.[A-z0-9_\-$]+/g
    )

    if (requestedPermissions) {
      requestedPermissions = requestedPermissions.reduce(
        (acc, current) => ({ ...acc, [current.split('.')[1]]: {} }),
        {}
      )
    }

    const bundledPlugin = JSON.stringify({
      sourceCode,
      requestedPermissions,
    }, null, 2)

    fs.writeFile(dest, bundledPlugin, 'utf8', (err) => {
      if (err) {
        console.log(`Build failure: could not write file '${dest}'`)
        if (_application.verbose) console.error(err)
        return
      }
      console.log(`Build success: '${src}' plugin bundled as '${dest}'`)
    })
  })
}

// watch utils

/**
 * Watch a single file or directory for changes, and build when files are
 * added or changed. Does not watch subdirectories.
 * 
 * @param {object} pathInfo - Path information object from validatePaths
 */
function watchFiles(pathInfo) {

  const { src, dest } = pathInfo

  const watcher = chokidar.watch(src.path, {
    ignored: str => str !== src.path && !str.endsWith('.js'),
    depth: 1,
  })

  watcher
    .on('add', path => {
      console.log(`File added: ${path}`)
      buildFile(path, getOutfilePath(path, dest.path))
    })
    .on('change', path => {
      console.log(`File changed: ${path}`)
      buildFile(path, getOutfilePath(path, dest.path))
    })
    .on('unlink', path => console.log(`File removed: ${path}`))
    .on('error', err => {
      console.error(err.message)
      if (err.stack && _application.verbose) console.err(error.stack)
    })

  watcher.add(`${src.path}/*`)
  console.log(`Watching '${src.path}' for changes...`)
}

// misc utils

/**
 * Validates paths for building or watching file(s).
 * 
 * @param {object} argv - Argv object from yargs
 * @param {string} argv.src - The src path
 * @param {string} argv.dest - The destination path
 */
async function validatePaths(argv) {

  const { src, dest } = argv

  if (!src || !dest) {
    throw new Error('Invalid params: must provide src and dest')
  }

  const result = {
    src: {
      path: src,
      isDirectory: await isDirectory(src),
    },
    dest: {
      path: dest,
      isDirectory: await isDirectory(dest),
    }
  }

  if (result.src.isDirectory && !result.dest.isDirectory) {
    throw new Error(
      'Invalid params: If src is a directory, then dest must be a directory.'
      )
  }

  if (!result.dest.isDirectory && !result.dest.path.endsWith('.json')) {
    throw new Error('Invalid params: Output file must be a JSON file.')
  }

  if (!result.src.isDirectory && result.dest.isDirectory) {
    result.dest = {
      path: pathUtils.join(result.dest.path, getOutfileName(result.src.path)),
      isDirectory: false,
    }
  }

  return result
}

async function isDirectory(p) {
  return new Promise((resolve, _) => {
    fs.stat(p, (err, stats) => {
      if (err || !stats) {
        if (err.code === 'ENOENT') return resolve(false)
        console.log(
          `Invalid params: Path '${p}' could not be resolved.`
        )
        if (err && _application.verbose) console.error(err)
        process.exit(1)
      }
      resolve(stats.isDirectory())
    })
  })
}

/**
 * Gets the complete out file path from the source file path and output
 * directory path. 
 * 
 * @param {string} srcFilePath - The source file path
 * @param {string} outDir - The out file directory
 * @returns - The complete out file path
 */
function getOutfilePath(srcFilePath, outDir) {
  return pathUtils.join(outDir, getOutfileName(srcFilePath))
}

/**
 * Gets the out file name from the source file name/path.
 * (Swaps '.js' for '.json')
 * 
 * @param {string} srcFilePath - The source file path
 */
function getOutfileName (srcFilePath) {
  const split = srcFilePath.split('/')
  return split[split.length - 1].match(/(.+)\.js/)[1] + '.json'
}
