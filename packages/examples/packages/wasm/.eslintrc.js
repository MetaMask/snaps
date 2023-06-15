module.exports = {
  extends: ['../../.eslintrc.js'],

  settings: {
    'import/extensions': ['.js', '.ts', '.wasm'],
  },

  parserOptions: {
    tsconfigRootDir: __dirname,
  },

  ignorePatterns: [
    '!.prettierrc.js',
    '**/!.eslintrc.js',
    '**/dist*/',
    'packages/**',
    'program/**',
    'build/**',
  ],
};
