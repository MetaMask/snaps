module.exports = {
  cliOptions: {
    port: 8082,
    transpilationMode: 'localOnly',
  },
  bundlerCustomizer: (bundler) => {
    bundler.transform('brfs');
  },
};
