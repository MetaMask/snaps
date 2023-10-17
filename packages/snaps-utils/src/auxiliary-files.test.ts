import { bytesToHex, stringToBytes } from '@metamask/utils';
import { base64 } from '@scure/base';

import { AuxiliaryFileEncoding, encodeAuxiliaryFile } from './auxiliary-files';

describe('encodeAuxiliaryFile', () => {
  it('returns value without modifying it for base64', () => {
    const value = base64.encode(stringToBytes('foo'));
    expect(
      encodeAuxiliaryFile(value, AuxiliaryFileEncoding.Base64),
    ).toStrictEqual(value);
  });

  it('re-encodes to hex when requested', () => {
    const bytes = stringToBytes('foo');
    const value = base64.encode(bytes);
    expect(encodeAuxiliaryFile(value, AuxiliaryFileEncoding.Hex)).toStrictEqual(
      bytesToHex(bytes),
    );
  });

  it('returns plaintext when requested', () => {
    const bytes = stringToBytes('foo');
    const value = base64.encode(bytes);
    expect(encodeAuxiliaryFile(value, AuxiliaryFileEncoding.Utf8)).toBe('foo');
  });
});
