
const fs = require('fs')
const path = require('path')

const { bundle } = require('../src/build')

const EXAMPLES_PATH = 'examples'

fs.readdir(EXAMPLES_PATH, (err, results) => {

  if (err) throw err

  results.forEach(examplesFile => {

    examplesFile = path.resolve(EXAMPLES_PATH, examplesFile)

    fs.stat(examplesFile, (err, stat) => {

      if (err) throw err

      if (stat && stat.isDirectory()) {

        try {

          const srcPath = path.resolve(examplesFile, 'index.js')
          const pkgPath = path.resolve(examplesFile, 'package.json')
          const pkgStat = fs.statSync(pkgPath)
          const srcStat = fs.statSync(srcPath)

          if (pkgStat && pkgStat.isFile() && srcStat && srcStat.isFile()) {
            bundle(
              srcPath,
              path.resolve(examplesFile, 'dist/bundle.js'),
              { sourceMaps: true }
            )
          } else {
            throw new Error()
          }
        } catch (error) {
          console.log(`Invalid example folder found: ${examplesFile}`)
          console.log(`Ensure it has valid 'package.json' and 'index.js' files.`)
        }
      }
    })
  })
})
