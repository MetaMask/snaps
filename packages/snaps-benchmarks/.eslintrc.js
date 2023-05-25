// eslint-disable-next-line import/unambiguous
module.exports = {
  extends: ['../../.eslintrc.js'],

  parserOptions: {
    tsconfigRootDir: __dirname,
  },

  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      extends: [
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended',
      ],
      rules: {
        '@typescript-eslint/no-shadow': [
          'error',
          {
            allow: ['Text'],
          },
        ],

        'react/display-name': 'off',
        'react/prop-types': 'off',

        'no-console': 'off',
      },
      settings: {
        react: {
          version: 'detect',
        },
      },
    },

    {
      files: ['**/*.js'],
      rules: {
        'node/no-unpublished-require': 'off',
      },
    },
  ],
};
