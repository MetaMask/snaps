#!/usr/bin/env node

const fs = require('fs')

const [,, ...args] = process.argv
let [command, source, flag, destination] = args

if (flag === '-o' && !destination) {
  destination = source.match(/(.+)\.js/)[1] + 'plugin.json'
}

if (command === 'build') {
  fs.readFile(source, 'utf8', function(err, contents) {
      const sourceCode = contents
      const requestedPermissions = contents
        .match(/ethereumProvider\.[A-z0-9_\-$]+/g)
        .reduce((acc, current) => ({ ...acc, [current.split('.')[1]]: {} }), {})
      
      const bundledPlugin = JSON.stringify({
        sourceCode,
        requestedPermissions,
      }, null, 2)
      
      fs.writeFile(destination, bundledPlugin, 'utf8', (err) => {
        if (err) return console.log(err);
        console.log('Plugin bundled!');
      })
  });
}