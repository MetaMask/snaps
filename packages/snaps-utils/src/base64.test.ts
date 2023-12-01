import { bytesToBase64, stringToBytes } from '@metamask/utils';
import { File } from 'buffer';

import { decodeBase64, encodeBase64 } from './base64';
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

describe('encodeBase64', () => {
  // We can remove this once we drop Node 18
  Object.defineProperty(globalThis, 'File', {
    value: File,
  });

  it('encodes vfile to base64', async () => {
    const vfile = new VirtualFile(
      stringToBytes(JSON.stringify({ foo: 'bar' })),
    );
    expect(await encodeBase64(vfile)).toBe('eyJmb28iOiJiYXIifQ==');
  });

  it('uses FileReader API when available', async () => {
    Object.defineProperty(globalThis, 'FileReader', {
      value: MockFileReader,
    });

    const vfile = new VirtualFile(
      stringToBytes(JSON.stringify({ foo: 'bar' })),
    );
    expect(await encodeBase64(vfile)).toBe('eyJmb28iOiJiYXIifQ==');
  });
});

describe('decodeBase64', () => {
  it('decodes base64 string to bytes', async () => {
    expect(await decodeBase64('eyJmb28iOiJiYXIifQ==')).toStrictEqual(
      stringToBytes(JSON.stringify({ foo: 'bar' })),
    );
  });
});
