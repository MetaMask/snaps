import { bytesToBase64, stringToBytes } from '@metamask/utils';

import { asyncDecode, asyncEncode } from './base64';
import { VirtualFile } from './virtual-file';

// Very basic mock that mimics the base64 encoding logic of the browser
class MockFileReader {
  onload?: () => any;

  onerror?: () => any;

  result?: any;

  error?: any;

  readAsDataURL(file: File) {
    file
      .arrayBuffer()
      .then((buffer) => {
        const u8 = new Uint8Array(buffer);

        this.result = `data:application/octet-stream;base64,${bytesToBase64(
          u8,
        )}`;

        this.onload?.();
      })
      .catch((error) => {
        this.error = error;
        this.onerror?.();
      });
  }
}

describe('asyncEncode', () => {
  it('encodes vfile to base64', async () => {
    const vfile = new VirtualFile(
      stringToBytes(JSON.stringify({ foo: 'bar' })),
    );
    expect(await asyncEncode(vfile)).toBe('eyJmb28iOiJiYXIifQ==');
  });

  it('uses FileReader API when available', async () => {
    Object.defineProperty(globalThis, 'FileReader', {
      value: MockFileReader,
    });

    const vfile = new VirtualFile(
      stringToBytes(JSON.stringify({ foo: 'bar' })),
    );
    expect(await asyncEncode(vfile)).toBe('eyJmb28iOiJiYXIifQ==');
  });
});

describe('asyncDecode', () => {
  it('decodes base64 string to bytes', async () => {
    expect(await asyncDecode('eyJmb28iOiJiYXIifQ==')).toStrictEqual(
      stringToBytes(JSON.stringify({ foo: 'bar' })),
    );
  });
});
