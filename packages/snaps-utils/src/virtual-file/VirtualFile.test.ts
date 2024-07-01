import { bytesToHex, stringToBytes } from '@metamask/utils';
import { base64 } from '@scure/base';

import { VirtualFile } from './VirtualFile';

const VALUE = 'foo\nbar';

describe('VirtualFile', () => {
  it('stores value string', () => {
    const file = new VirtualFile({ value: VALUE });
    expect(file.value).toBe(VALUE);
    expect(file.toString()).toStrictEqual(VALUE);
  });

  it('stores value array', () => {
    const array = new TextEncoder().encode(VALUE);
    const file = new VirtualFile({ value: array });
    expect(file.value).toStrictEqual(array);
    expect(file.toString()).toStrictEqual(VALUE);
  });

  it('cant take options or string', () => {
    const file1 = new VirtualFile(VALUE);
    const file2 = new VirtualFile({ value: VALUE });
    expect(file1.value).toStrictEqual(file2.value);
    expect(file1.value).toStrictEqual(VALUE);
  });

  describe('size', () => {
    it('returns string length for strings', () => {
      const file = new VirtualFile({ value: 'foo' });
      expect(file.size).toBe(3);
    });

    it('returns byte length for Uint8Array', () => {
      const value = stringToBytes('foo bar');
      const file = new VirtualFile({ value });
      expect(file.size).toBe(7);
    });
  });

  describe('toString()', () => {
    it('supports encodings', () => {
      // TextEncoder doesn't support utf-16 anymore
      // "foo\nbar" in utf-16be
      const array = new Uint8Array([
        0x00, 0x66, 0x00, 0x6f, 0x00, 0x6f, 0x00, 0x0a, 0x00, 0x62, 0x00, 0x61,
        0x00, 0x72,
      ]);
      const file = new VirtualFile({ value: array });
      expect(file.toString('utf-16be')).toStrictEqual(VALUE);
    });

    it('supports hex', () => {
      const value = stringToBytes('foo');
      const file = new VirtualFile({ value });
      expect(file.toString('hex')).toStrictEqual(bytesToHex(value));
    });

    it('supports base64', () => {
      const value = stringToBytes('foo');
      const file = new VirtualFile({ value });
      expect(file.toString('base64')).toStrictEqual(base64.encode(value));
    });
  });

  describe('clone()', () => {
    it('deep clones properties', () => {
      const value = VALUE;
      const result = { foo: 'bar' };
      const data = { bar: 'foo' };
      const path = '/foo/bar';
      const file = new VirtualFile({ value, result, data, path });
      const file2 = file.clone();
      file2.value = 'asd';
      file2.result.foo = 'asd';
      file2.data.bar = 'asd';
      file2.path = 'asd';
      expect(file.value).toStrictEqual(value);
      expect(file2.value).not.toStrictEqual(value);
      expect(file.result).toStrictEqual(result);
      expect(file2.result).not.toStrictEqual(result);
      expect(file.data).toStrictEqual(data);
      expect(file2.data).not.toStrictEqual(data);
      expect(file.path).toStrictEqual(path);
      expect(file2.path).not.toStrictEqual(path);
    });

    it('clones Uint8Array properly', () => {
      const array = new TextEncoder().encode(VALUE);
      const file1 = new VirtualFile({ value: array });
      const file2 = file1.clone();

      array[0] = 42;

      expect(file1.value[0]).toBe(42);
      expect(file2.value[0]).not.toBe(42);
    });
  });
});
