import type { ViteFinal } from '@storybook/builder-vite';
import type { PresetProperty } from '@storybook/types';
import { resolve, dirname, join } from 'path';
import type { PluginOption } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

/**
 * Get the absolute path of a file in an Node.js package.
 *
 * @param input - The package name.
 * @param paths - The paths to join to the package directory.
 * @returns The absolute path.
 */
const getAbsolutePath = (input: string, ...paths: string[]): string =>
  resolve(dirname(require.resolve(join(input, 'package.json'))), ...paths);

/**
 * The core preset for the Snaps Storybook package. This preset configures the
 * Storybook builder and renderer to use the Webpack builder and Snaps renderer.
 */
export const core: PresetProperty<'core'> = {
  builder: getAbsolutePath('@storybook/builder-vite'),
  renderer: getAbsolutePath('@metamask/snaps-storybook'),
};

/**
 * This function is called by Storybook to configure the static directories. It
 * is used to add the `@metamask/snaps-storybook` package's assets to the static
 * directories, so that they are copied to the output directory during the
 * build.
 *
 * @param input - The original static directories.
 * @returns The modified static directories.
 */
export const staticDirs: PresetProperty<'staticDirs'> = (input = []) => {
  return [
    ...input,
    {
      from: getAbsolutePath('@metamask/snaps-storybook', 'src/assets'),
      to: 'snaps',
    },
  ];
};

/**
 * This function is called by Storybook to configure the preview. It is used to
 * add the `preview.js` file to the preview configuration, which sets up the
 * renderer for the Snaps components.
 *
 * @param input - The original preview configuration.
 * @returns The modified preview configuration.
 */
export const previewAnnotations: PresetProperty<'previewAnnotations'> = (
  input = [],
) => {
  return [
    ...input,
    require.resolve('./preview.mjs'),
    require.resolve('./globals.mjs'),
    require.resolve('./decorators.mjs'),
  ];
};

/**
 * This function is called by Storybook to configure the manager entries. It is
 * used to add the `manager.js` file to the manager configuration, which sets up
 * the Snaps addon.
 *
 * @param input - The original manager entries.
 * @returns The modified manager entries.
 */
export const managerEntries = (input: string[] = []) => {
  return [...input, require.resolve('./manager.mjs')];
};

/**
 * Extra addons to include in the Storybook configuration.
 */
export const addons: PresetProperty<'addons'> = [
  getAbsolutePath('@storybook/addon-docs'),
  getAbsolutePath('@storybook/addon-toolbars'),
];

const CUSTOM_HEAD = `
  <link rel="prefetch" href="./snaps/fonts/Euclid-Circular-B-Light.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="prefetch" href="./snaps/fonts/Euclid-Circular-B-Light-Italic.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="prefetch" href="./snaps/fonts/Euclid-Circular-B-Regular.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="prefetch" href="./snaps/fonts/Euclid-Circular-B-Italic.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="prefetch" href="./snaps/fonts/Euclid-Circular-B-Medium.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="prefetch" href="./snaps/fonts/Euclid-Circular-B-Medium-Italic.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="prefetch" href="./snaps/fonts/Euclid-Circular-B-SemiBold.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="prefetch" href="./snaps/fonts/Euclid-Circular-B-SemiBold-Italic.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="prefetch" href="./snaps/fonts/Euclid-Circular-B-Bold.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="prefetch" href="./snaps/fonts/Euclid-Circular-B-Bold-Italic.woff2" as="font" type="font/woff2" crossorigin />

  <link rel="prefetch" href="./snaps/fonts/Inter-Light.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="prefetch" href="./snaps/fonts/Inter-Regular.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="prefetch" href="./snaps/fonts/Inter-Medium.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="prefetch" href="./snaps/fonts/Inter-SemiBold.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="prefetch" href="./snaps/fonts/Inter-Bold.woff2" as="font" type="font/woff2" crossorigin />

  <link rel="stylesheet" href="./snaps/global.css" />
  <link rel="stylesheet" href="./snaps/fonts/fonts.css" />
`;

/**
 * This function is called by Storybook to configure the manager head. It is
 * used to inject the custom fonts into the manager head.
 *
 * @param head - The original manager head.
 * @returns The modified manager head.
 */
export const managerHead: PresetProperty<'managerHead'> = (head = '') => `
  ${head}
  ${CUSTOM_HEAD}
`;

/**
 * This function is called by Storybook to configure the preview head. It is
 * used to inject the custom fonts into the preview head.
 *
 * @param head - The original preview head.
 * @returns The modified preview head.
 */
export const previewHead: PresetProperty<'previewHead'> = (head = '') => `
  ${head}
  ${CUSTOM_HEAD}
`;

/**
 * Modify the Vite configuration to include the Node.js globals and modules
 * polyfills.
 *
 * @param config - The Vite configuration.
 * @returns The modified Vite configuration.
 */
export const viteFinal: ViteFinal = (config) => {
  return {
    ...config,
    plugins: [
      ...(config.plugins as PluginOption[]),
      nodePolyfills({
        globals: {
          Buffer: true,
          process: true,
        },
      }),
    ],
  };
};
