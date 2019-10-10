
const fs = require('fs')
const path = require('path')

const EXAMPLE_PATH = 'examples/hello-plugin'
const TEMPLATE_PATH = 'src/initTemplate.json'

const html = fs.readFileSync(path.join(EXAMPLE_PATH, 'index.html')).toString()
const js = fs.readFileSync(path.join(EXAMPLE_PATH, 'index.js')).toString()

fs.writeFileSync(TEMPLATE_PATH, JSON.stringify({
  html,
  js
}, null, 2))

console.log('success: wrote src/initTemplate.json')
