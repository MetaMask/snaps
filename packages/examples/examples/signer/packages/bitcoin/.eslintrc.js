module.exports = {
  extends: ['../../.eslintrc.js'],

  parserOptions: {
    tsconfigRootDir: __dirname,
  },

  ignorePatterns: ['!.eslintrc.js', '!.prettierrc.js', 'dist/'],
};
