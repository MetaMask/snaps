import { AuxiliaryFileEncoding } from '@metamask/snaps-sdk';
import { bytesToHex, stringToBytes } from '@metamask/utils';
import { base64 } from '@scure/base';

import { encodeAuxiliaryFile } from './auxiliary-files';

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
