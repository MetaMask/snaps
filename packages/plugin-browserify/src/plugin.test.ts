import { Readable } from 'stream';
import browserify from 'browserify';
import concat from 'concat-stream';
import plugin, { SnapsBrowserifyTransform } from './plugin';

/**
 * Takes a string value and pushes it to a readable stream. Used for testing
 * purposes.
 *
 * @param value - The value to push to a readable stream.
 * @returns The readable stream containing the value.
 */
const toStream = (value: string) => {
  const readable = new Readable();
  readable.push(value);
  readable.push(null);

  return readable;
};

describe('SnapsBrowserifyTransform', () => {
  it('processes the data', async () => {
    const transform = new SnapsBrowserifyTransform({});
    const stream = toStream(' foo bar ');

    const result = await new Promise((resolve) => {
      const concatStream = concat((value) => resolve(value.toString('utf-8')));

      stream.pipe(transform).pipe(concatStream);
    });

    expect(result).toBe('foo bar');
  });

  it('works without options', async () => {
    const transform = new SnapsBrowserifyTransform();
    const stream = toStream(' foo bar ');

    const result = await new Promise((resolve) => {
      const concatStream = concat((value) => resolve(value.toString('utf-8')));

      stream.pipe(transform).pipe(concatStream);
    });

    expect(result).toBe('foo bar');
  });
});

describe('plugin', () => {
  it('processes files using Browserify', async () => {
    const value = toStream(`const foo = 'bar';`);

    const result = await new Promise((resolve, reject) => {
      const bundler = browserify();

      bundler.plugin(plugin);
      bundler.add(value);

      bundler.bundle((error, src) => {
        if (error) {
          return reject(error);
        }

        return resolve(src.toString('utf-8'));
      });
    });

    expect(result).toContain(`const foo = 'bar';`);
  });

  it('applies a transform', async () => {
    const value = toStream(`
      // foo bar
      /* baz qux */
      const foo = 'bar';
    `);

    const result = await new Promise((resolve, reject) => {
      const bundler = browserify();

      bundler.add(value);
      bundler.plugin(plugin);

      bundler.bundle((error, src) => {
        if (error) {
          return reject(error);
        }

        return resolve(src.toString('utf-8'));
      });
    });

    expect(result).not.toContain(`// foo bar`);
    expect(result).not.toContain(`/* baz qux */`);
  });

  it('forwards the options', async () => {
    const value = toStream(`
      // foo bar
      /* baz qux */
      const foo = 'bar';
    `);

    const result = await new Promise((resolve, reject) => {
      const bundler = browserify();

      bundler.plugin(plugin, { stripComments: false });
      bundler.add(value);

      bundler.bundle((error, src) => {
        if (error) {
          return reject(error);
        }

        return resolve(src.toString('utf-8'));
      });
    });

    expect(result).toContain(`// foo bar`);
    expect(result).toContain(`/* baz qux */`);
  });
});
