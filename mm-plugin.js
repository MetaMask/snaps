#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const yargs = require('yargs')
const http = require('http')
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
  .help()
  .argv

// command handlers

function build (argv) {
  // validate and catch
  validatePaths(argv)
  .then((res) => {
    buildFiles(res)
  })
}

function watch ({ src , dest }) {

}

function serve ({ port, root }) {

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
      console.log(`Port ${port} already in use.`)
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

// util

function buildFiles({ src, dest }) {
  if (!src.isDirectory) {
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
            path.join(src.path, file.name), getOutfilePath(file.name, dest.path)
          )
        }
      })

      if (!hasSourceFiles) throw new Error(
        'Invalid directory: Source directory contains no valid source files.'
      )
    })
  }
}

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

async function validatePaths({ src, dest }) {

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
      path: path.join(result.dest.path, getOutfileName(result.src.path)),
      isDirectory: false,
    }
  }

  return result
}

async function isDirectory(p) {
  return new Promise((resolve, _) => {
    fs.stat(p, (err, stats) => {
      if (err) throw err
      if (stats) return resolve(stats.isDirectory())
      throw new Error(`Uknown error: path '${p}' could not be resolved.`)
    })
  })
}

function getOutfilePath(srcFilePath, outDir) {
  return path.join(outDir, getOutfileName(srcFilePath))
}

function getOutfileName (srcFilePath) {
  console.log(_application)
  const split = srcFilePath.split('/')
  return split[split.length - 1].match(/(.+)\.js/)[1] + '.json'
}
