const webpack = require('webpack');

const config = require('../webpack.config');

/**
 * Indent a message by a given number of spaces.
 *
 * @param {string} message - The message to indent.
 * @param {number} spaces - The number of spaces to indent each line.
 * @returns {string} The indented message.
 */
function indent(message, spaces = 2) {
  return message
    .split('\n')
    .map((line) => ' '.repeat(spaces) + line)
    .join('\n');
}

webpack(config, (error, stats) => {
  if (error) {
    console.error(
      'Webpack failed to build. See the error(s) below for more details.',
    );

    console.log(indent(error.message, 2));
    return;
  }

  console.log(
    stats.toString({
      all: false,
      assets: true,
      colors: true,
      errors: true,
      assetsSort: 'name',
    }),
  );
});
