// const pluginWorker = require('./dist/pluginWorker')
const { PLUGIN_STREAM_NAMES } = require('./src/enums')

module.exports = {
  plugin: {
    // worker: pluginWorker,
    streamNames: PLUGIN_STREAM_NAMES,
  },
}
