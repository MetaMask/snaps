import { GatsbyConfig } from 'gatsby';

import packageJson from './package.json';

const config: GatsbyConfig = {
  // Required to use React 17+'s JSX transform, to avoid having to import React
  // in every file.
  jsxRuntime: 'automatic',

  // If a `GATSBY_PREFIX` environment variable is set, we use it as the path
  // prefix. This is set in CI to ensure that the site is built with the correct
  // path prefix. Otherwise, we use the `package.json` version.
  pathPrefix: `/test-snaps/${process.env.GATSBY_PREFIX ?? packageJson.version}`,

  siteMetadata: {
    title: 'Test Snaps',
    version: packageJson.version,
  },

  plugins: [
    'gatsby-plugin-sass',
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'Test Snaps',
        icon: 'src/assets/icon.svg',
      },
    },
    {
      resolve: 'gatsby-plugin-react-redux',
      options: {
        pathToCreateStoreModule: './src/store.ts',
      },
    },
  ],
};

export default config;
