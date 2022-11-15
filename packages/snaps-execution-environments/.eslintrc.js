module.exports = {
  extends: ['../../.eslintrc.js'],

  parserOptions: {
    tsconfigRootDir: __dirname,
  },

  ignorePatterns: ['src/openrpc.json', 'webpack.config.js', '__test__'],
};
