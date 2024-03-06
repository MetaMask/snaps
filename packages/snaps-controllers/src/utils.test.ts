import { VirtualFile } from '@metamask/snaps-utils';
import {
  getMockSnapFiles,
  getSnapManifest,
} from '@metamask/snaps-utils/test-utils';
import { assert } from '@metamask/utils';

import { LoopbackLocation } from './test-utils';
import { getSnapFiles, setDiff, setIntersection } from './utils';

describe('setDiff', () => {
  it('does nothing on empty type {}-B', () => {
    expect(setDiff({}, { a: 'foo' })).toStrictEqual({});
  });

  it('does nothing on empty type A-{}', () => {
    expect(setDiff({ a: 'foo', b: 'bar' }, {})).toStrictEqual({
      a: 'foo',
      b: 'bar',
    });
  });

  it('does a difference', () => {
    expect(setDiff({ a: 'foo', b: 'bar' }, { a: 0 })).toStrictEqual({
      b: 'bar',
    });
  });

  it('additional B properties have no effect in A-B', () => {
    expect(
      setDiff({ a: 'foo', b: 'bar' }, { b: 0, c: 'foobar' }),
    ).toStrictEqual({ a: 'foo' });
  });

  it('works for the same object A-A', () => {
    const object = { a: 'foo', b: 'bar' };
    expect(setDiff(object, object)).toStrictEqual({});
  });
});

describe('setIntersection', () => {
  it('does nothing on empty type ({} ∩ B)', () => {
    expect(setIntersection({}, { a: 'foo' })).toStrictEqual({});
  });

  it('does nothing on empty type (A ∩ {})', () => {
    expect(setIntersection({ a: 'foo', b: 'bar' }, {})).toStrictEqual({});
  });

  it('does an intersection (A ∩ B)', () => {
    expect(
      setIntersection(
        { a: 'foo', b: 'bar', c: 'c' },
        { a: 'bar', b: 'bar', c: 'c', d: 'd', e: 'e' },
      ),
    ).toStrictEqual({
      a: 'foo',
      b: 'bar',
      c: 'c',
    });
  });

  it('additional B properties have no effect in (A ∩ B)', () => {
    expect(
      setIntersection({ a: 'foo', b: 'bar' }, { b: 0, c: 'foobar' }),
    ).toStrictEqual({ b: 'bar' });
  });

  it('works for the same object (A ∩ A)', () => {
    const object = { a: 'foo', b: 'bar' };
    expect(setIntersection(object, object)).toStrictEqual({
      a: 'foo',
      b: 'bar',
    });
  });
});

describe('getSnapFiles', () => {
  it('returns an empty array if `files` is undefined', async () => {
    const location = new LoopbackLocation();
    expect(await getSnapFiles(location)).toStrictEqual([]);
  });

  it('returns an empty array if `files` is an empty array', async () => {
    const location = new LoopbackLocation();
    expect(await getSnapFiles(location, [])).toStrictEqual([]);
  });

  it('gets the files from the specified location', async () => {
    const { manifest, sourceCode, svgIcon } = getMockSnapFiles({
      manifest: getSnapManifest(),
    });

    assert(svgIcon);
    const location = new LoopbackLocation({
      manifest,
      files: [
        sourceCode,
        svgIcon,
        new VirtualFile({
          path: 'foo.json',
          value: 'foo',
        }),
        new VirtualFile({
          path: 'bar.json',
          value: 'bar',
        }),
      ],
    });

    expect(
      await getSnapFiles(location, ['foo.json', 'bar.json']),
    ).toStrictEqual([
      new VirtualFile({
        path: 'foo.json',
        value: 'foo',
      }),
      new VirtualFile({
        path: 'bar.json',
        value: 'bar',
      }),
    ]);
  });
});
