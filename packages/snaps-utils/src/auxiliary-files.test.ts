import { AuxiliaryFileEncoding } from '@metamask/snaps-sdk';
import { bytesToHex, stringToBytes } from '@metamask/utils';
import { base64 } from '@scure/base';

import { encodeAuxiliaryFile, validateAuxiliaryFiles } from './auxiliary-files';
import { VirtualFile } from './virtual-file';

describe('encodeAuxiliaryFile', () => {
  it('returns value without modifying it for base64', async () => {
    const value = base64.encode(stringToBytes('foo'));
    expect(
      await encodeAuxiliaryFile(value, AuxiliaryFileEncoding.Base64),
    ).toStrictEqual(value);
  });

  it('re-encodes to hex when requested', async () => {
    const bytes = stringToBytes('foo');
    const value = base64.encode(bytes);
    expect(
      await encodeAuxiliaryFile(value, AuxiliaryFileEncoding.Hex),
    ).toStrictEqual(bytesToHex(bytes));
  });

  it('returns plaintext when requested', async () => {
    const bytes = stringToBytes('foo');
    const value = base64.encode(bytes);
    expect(await encodeAuxiliaryFile(value, AuxiliaryFileEncoding.Utf8)).toBe(
      'foo',
    );
  });
});

describe('validateAuxiliaryFiles', () => {
  it('throws if files are too large', async () => {
    expect(() =>
      validateAuxiliaryFiles([new VirtualFile(new Uint8Array(100_000_000))]),
    ).toThrow('Static files required by the Snap must be smaller than 64 MB.');
  });

  it('passes when files are within size limits', async () => {
    expect(() =>
      validateAuxiliaryFiles([new VirtualFile(new Uint8Array(63_000_000))]),
    ).not.toThrow(
      'Static files required by the Snap must be smaller than 64 MB.',
    );
  });
});
