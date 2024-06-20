import { VirtualFile } from '@metamask/snaps-utils';
import { stringToBytes } from '@metamask/utils';
import { resolve } from 'path';

import {
  getContentType,
  getFileSize,
  getFileToUpload,
  getSnapFile,
} from './files';

describe('getSnapFile', () => {
  it('returns the file', async () => {
    const files = [
      new VirtualFile({
        path: 'foo',
        value: stringToBytes('bar'),
      }),
    ];

    expect(await getSnapFile(files, 'foo')).toBe('YmFy');
  });

  it('returns null if the file is not found', async () => {
    const files = [
      new VirtualFile({
        path: 'foo',
        value: stringToBytes('bar'),
      }),
    ];

    expect(await getSnapFile(files, 'bar')).toBeNull();
  });
});

describe('getContentType', () => {
  it('returns the content type', () => {
    expect(getContentType('.jpg')).toBe('image/jpeg');
    expect(getContentType('.png')).toBe('image/png');
    expect(getContentType('.gif')).toBe('image/gif');
  });

  it('returns the default content type for an unknown file extension', () => {
    expect(getContentType('.foo')).toBe('application/octet-stream');
  });

  it('returns the default content type for an empty string', () => {
    expect(getContentType('')).toBe('application/octet-stream');
  });
});

describe('getFileSize', () => {
  it('returns the file size for a `Uint8Array`', async () => {
    expect(await getFileSize(new Uint8Array([1, 2, 3]))).toBe(3);
  });

  it('returns the file size for a file path', async () => {
    expect(
      await getFileSize(resolve(__dirname, '../../test-utils/snap/snap.js')),
    ).toBe(112);
  });
});

describe('getFileToUpload', () => {
  const MOCK_FILE = resolve(__dirname, '../../test-utils/snap/snap.js');

  it('returns the file object', async () => {
    const file = await getFileToUpload(MOCK_FILE, {
      fileName: 'bar.js',
      contentType: 'application/foo',
    });

    expect(file).toStrictEqual({
      name: 'bar.js',
      contentType: 'application/foo',
      size: 112,
      contents:
        'Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGUKY29uc29sZS5sb2coJ0hlbGxvLCB3b3JsZCEnKTsKCm1vZHVsZS5leHBvcnRzLm9uUnBjUmVxdWVzdCA9ICgpID0+IG51bGw7Cg==',
    });
  });

  it('returns the file object with content type inferred from the file name', async () => {
    const file = await getFileToUpload(MOCK_FILE, {
      fileName: 'bar.js',
    });

    expect(file).toStrictEqual({
      name: 'bar.js',
      contentType: 'application/javascript',
      size: 112,
      contents:
        'Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGUKY29uc29sZS5sb2coJ0hlbGxvLCB3b3JsZCEnKTsKCm1vZHVsZS5leHBvcnRzLm9uUnBjUmVxdWVzdCA9ICgpID0+IG51bGw7Cg==',
    });
  });

  it('returns the file object with the default file name', async () => {
    const file = await getFileToUpload(MOCK_FILE);

    expect(file).toStrictEqual({
      name: 'snap.js',
      contentType: 'application/javascript',
      size: 112,
      contents:
        'Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGUKY29uc29sZS5sb2coJ0hlbGxvLCB3b3JsZCEnKTsKCm1vZHVsZS5leHBvcnRzLm9uUnBjUmVxdWVzdCA9ICgpID0+IG51bGw7Cg==',
    });
  });

  it('returns the file object from a Uint8Array', async () => {
    const file = await getFileToUpload(new Uint8Array([1, 2, 3]));

    expect(file).toStrictEqual({
      name: '',
      contentType: 'application/octet-stream',
      size: 3,
      contents: 'AQID',
    });
  });
});
