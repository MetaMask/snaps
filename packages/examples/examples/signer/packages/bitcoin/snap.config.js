const through = require('through2');

module.exports = {
  cliOptions: {
    src: './src/index.ts',
    port: 8102,
  },
  bundlerCustomizer: (bundler) => {
    // We don't provide Buffer by default, so we need to provide it manually.
    bundler.transform(function () {
      let data = '';
      return through(
        function (buffer, _encoding, callback) {
          data += buffer;
          callback();
        },

        function (callback) {
          this.push("globalThis.Buffer = require('buffer/').Buffer;");
          this.push(data);
          callback();
        },
      );
    });
  },
};
