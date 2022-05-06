import plugin from './plugin';

export { default } from './plugin';
export type { Options } from './plugin';

// This is required for Browserify to work when specifying just the module name,
// rather than importing the plugin function.
module.exports = plugin;
