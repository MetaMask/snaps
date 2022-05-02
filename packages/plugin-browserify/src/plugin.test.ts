import { Readable } from 'stream';
import browserify from 'browserify';
import concat from 'concat-stream';
import plugin, { getTransform } from './plugin';

const toStream = (value: string) => {
  const readable = new Readable();
  readable.push(value);
  readable.push(null);

  return readable;
};

describe('getTransform', () => {
  it('returns a transform stream which processes the data', async () => {
    const transform = getTransform('foo', {});
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

      bundler.plugin(plugin);
      bundler.add(value);

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
