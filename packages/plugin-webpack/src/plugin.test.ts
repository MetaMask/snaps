// Allow Jest snapshots because the test outputs are illegible.
/* eslint-disable jest/no-restricted-matchers */

import webpack, { Stats } from 'webpack';
import { createFsFromVolume, Volume } from 'memfs';
import SnapsWebpackPlugin from './plugin';

describe('SnapsWebpackPlugin', () => {
  it('processes files using Webpack', async () => {
    const fileSystem = createFsFromVolume(new Volume());
    const { promises: fs } = fileSystem;

    const bundler = webpack({
      mode: 'none',
      entry: {
        foo: '/foo.js',
      },
      output: {
        path: '/lib',
        filename: '[name].js',
      },
      plugins: [new SnapsWebpackPlugin()],
    });

    bundler.inputFileSystem = fileSystem;
    bundler.outputFileSystem = fileSystem;

    await fs.mkdir('/lib', { recursive: true });
    await fs.writeFile('/foo.js', `const foo = 'bar';`);

    await new Promise<Stats>((resolve, reject) =>
      bundler.run((error, stats) => {
        if (error || !stats) {
          return reject(error);
        }

        return resolve(stats);
      }),
    );

    const result = await fs.readFile('/lib/foo.js', 'utf-8');

    expect(result).toMatchSnapshot();
  });

  it('applies a transform', async () => {
    const fileSystem = createFsFromVolume(new Volume());
    const { promises: fs } = fileSystem;

    const bundler = webpack({
      mode: 'none',
      entry: {
        foo: '/foo.js',
      },
      output: {
        path: '/lib',
        filename: '[name].js',
      },
      plugins: [new SnapsWebpackPlugin()],
    });

    bundler.inputFileSystem = fileSystem;
    bundler.outputFileSystem = fileSystem;

    await fs.mkdir('/lib', { recursive: true });
    await fs.writeFile(
      '/foo.js',
      `
        // foo bar
        /* baz qux */
        const foo = 'bar';
     `,
    );

    await new Promise<Stats>((resolve, reject) =>
      bundler.run((error, stats) => {
        if (error || !stats) {
          return reject(error);
        }

        return resolve(stats);
      }),
    );

    const result = await fs.readFile('/lib/foo.js', 'utf-8');

    expect(result).toMatchSnapshot();
    expect(result).not.toContain(`// foo bar`);
    expect(result).not.toContain(`/* baz qux */`);
  });

  it('forwards the options', async () => {
    const fileSystem = createFsFromVolume(new Volume());
    const { promises: fs } = fileSystem;

    const bundler = webpack({
      mode: 'none',
      entry: {
        foo: '/foo.js',
      },
      output: {
        path: '/lib',
        filename: '[name].js',
      },
      plugins: [new SnapsWebpackPlugin({ stripComments: false })],
    });

    bundler.inputFileSystem = fileSystem;
    bundler.outputFileSystem = fileSystem;

    await fs.mkdir('/lib', { recursive: true });
    await fs.writeFile(
      '/foo.js',
      `
        // foo bar
        /* baz qux */
        const foo = 'bar';
     `,
    );

    await new Promise<Stats>((resolve, reject) =>
      bundler.run((error, stats) => {
        if (error || !stats) {
          return reject(error);
        }

        return resolve(stats);
      }),
    );

    const result = await fs.readFile('/lib/foo.js', 'utf-8');

    expect(result).toMatchSnapshot();
    expect(result).toContain(`// foo bar`);
    expect(result).toContain(`/* baz qux */`);
  });

  it('runs on the entire bundle', async () => {
    const fileSystem = createFsFromVolume(new Volume());
    const { promises: fs } = fileSystem;

    const bundler = webpack({
      mode: 'none',
      entry: {
        foo: '/foo.js',
      },
      output: {
        path: '/lib',
        filename: '[name].js',
      },
      plugins: [new SnapsWebpackPlugin()],
    });

    bundler.inputFileSystem = fileSystem;
    bundler.outputFileSystem = fileSystem;

    await fs.mkdir('/lib', { recursive: true });

    await fs.writeFile(
      '/foo.js',
      `
        import { bar } from './bar';

        // Sets foo to bar
        const foo = bar;
     `,
    );

    await fs.writeFile(
      '/bar.js',
      `
        // Returns baz
        export const bar = 'baz';
     `,
    );

    await new Promise<Stats>((resolve, reject) =>
      bundler.run((error, stats) => {
        if (error || !stats) {
          return reject(error);
        }

        return resolve(stats);
      }),
    );

    const result = await fs.readFile('/lib/foo.js', 'utf-8');

    expect(result).toMatchSnapshot();
    expect(result).not.toContain(`// Sets foo to bar`);
    expect(result).not.toContain(`// Returns baz`);
  });
});
