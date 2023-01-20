import { base64 } from '@scure/base';

import { checksum, checksumFiles } from './checksum';
import { VirtualFile } from './index.browser';

const EMPTY_SHA256 = '47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=';

describe('checksum', () => {
  const FOO_BAR_STR = 'foo bar';
  const FOO_BAR_UINT8 = new Uint8Array([
    0x66, 0x6f, 0x6f, 0x20, 0x62, 0x61, 0x72,
  ]);
  // echo -n 'foo bar' | shasum -a 256 | cut -d ' ' -f 1| xxd -r -p | base64
  const FOO_BAR_SHA256 = '+8Gp+Fjqnhd5FpZL2Iw9N7kaHoRBJ2XimVB3fyZcS3U=';

  it('takes string', () => {
    expect(base64.encode(checksum(FOO_BAR_STR))).toBe(FOO_BAR_SHA256);
  });

  it('takes Uint8Array', () => {
    expect(base64.encode(checksum(FOO_BAR_UINT8))).toBe(FOO_BAR_SHA256);
  });

  it('takes VirtualFile', () => {
    expect(base64.encode(checksum(new VirtualFile(FOO_BAR_STR)))).toBe(
      FOO_BAR_SHA256,
    );

    expect(base64.encode(checksum(new VirtualFile(FOO_BAR_UINT8)))).toBe(
      FOO_BAR_SHA256,
    );
  });

  it('works on empty string', () => {
    expect(base64.encode(checksum(''))).toBe(EMPTY_SHA256);
    expect(base64.encode(checksum(new Uint8Array()))).toBe(EMPTY_SHA256);
  });
});

describe('checkumFiles', () => {
  it('throws on duplicated paths', () => {
    const files = [
      new VirtualFile({ value: 'foo', path: '/foo' }),
      new VirtualFile({ value: 'bar', path: '/foo' }),
    ];
    expect(() => checksumFiles(files)).toThrow(
      'Tried to sort files with non-unique paths.',
    );
  });

  it("doesn't modify the original array", () => {
    const files = [
      new VirtualFile({ value: 'b', path: '/b' }),
      new VirtualFile({ value: 'a', path: '/a' }),
    ];

    checksumFiles(files);

    expect(files[0]).toStrictEqual(
      expect.objectContaining({ value: 'b', path: '/b' }),
    );

    expect(files[1]).toStrictEqual(
      expect.objectContaining({ value: 'a', path: '/a' }),
    );
  });

  it('works with no files', () => {
    // The question is what should happen when there's no files?
    // Since we concatenate all the hashes together, no files means there's no hashes to join
    // So we calculate a final hash from empty buffer.
    //
    // This sounds like the most sensible thing to happen.
    expect(base64.encode(checksumFiles([]))).toBe(EMPTY_SHA256);
  });

  it('works with empty files', () => {
    const files = [
      new VirtualFile({ value: '', path: '/a' }),
      new VirtualFile({ value: '', path: '/b' }),
    ];

    expect(base64.encode(checksumFiles(files))).toBe(
      'LbpdvDOecxauomg/r4OcG3se4jE9t5IRJYgRjfBmqjU=',
    );
  });

  it('calculates checksums', () => {
    const files = [
      new VirtualFile({ value: 'foo', path: '/foo' }),
      new VirtualFile({ value: 'bar', path: '/bar' }),
    ];
    expect(base64.encode(checksumFiles(files))).toBe(
      'tjhLioya2X6R2otoBioD45fugx9i65F72f5yic0y6ws=',
    );
  });

  it('is order independent', () => {
    const files1 = [
      new VirtualFile({ value: 'foo', path: '/a' }),
      new VirtualFile({ value: 'bar', path: '/b' }),
      new VirtualFile({ value: 'foobar', path: '/c' }),
    ];
    const files2 = [
      new VirtualFile({ value: 'foobar', path: '/c' }),
      new VirtualFile({ value: 'bar', path: '/b' }),
      new VirtualFile({ value: 'foo', path: '/a' }),
    ];

    const hash1 = base64.encode(checksumFiles(files1));
    const hash2 = base64.encode(checksumFiles(files2));

    expect(hash1).toBe(hash2);
  });
});
