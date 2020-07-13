const pluginWorker = require('./dist/pluginWorker')
const { PLUGIN_STREAM_NAMES } = require('./enums')

module.exports = {
  pluginWorker: {
    worker: pluginWorker,
    streamNames: PLUGIN_STREAM_NAMES,
  },
}
