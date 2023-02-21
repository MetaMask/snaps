/**
 * @jest-environment node
 */

import { assert } from '@metamask/utils';
import { createFsFromVolume, Volume } from 'memfs';
import { join } from 'path';
import { webpack, Configuration } from 'webpack';

import createConfig from '../webpack.config';

jest.setTimeout(30000);

describe('bundle', () => {
  it.each(['iframe', 'offscreen'])(
    'includes SES in the %s bundle',
    async (bundleName) => {
      expect.assertions(3);

      const fileSystem = createFsFromVolume(new Volume());
      const configArray = createConfig() as Configuration[];

      const config = configArray.find(({ name }) => name === bundleName);
      assert(config);
      assert(config.output?.path);

      const compiler = webpack(config);
      compiler.outputFileSystem = fileSystem;

      await new Promise<void>((resolve) => {
        compiler.run((error, stats) => {
          expect(error).toBeNull();
          expect(stats?.hasErrors()).toBe(false);

          resolve();
        });
      });

      const bundle = await fileSystem.promises.readFile(
        join(config.output.path, 'index.html'),
        'utf8',
      );

      // eslint-disable-next-line jest/no-restricted-matchers
      expect(bundle).toMatchSnapshot();
    },
  );
});
