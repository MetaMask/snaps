import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';
import { bytesToBase64, stringToBytes } from '@metamask/utils';

import { UploadedFiles, UploadForm } from './components';

const MOCK_IMAGE = '<svg>foo</svg>';
const MOCK_IMAGE_BYTES = stringToBytes(MOCK_IMAGE);

const MOCK_OTHER_IMAGE = '<svg>bar</svg>';
const MOCK_OTHER_IMAGE_BYTES = stringToBytes(MOCK_OTHER_IMAGE);

describe('onRpcRequest', () => {
  it('throws an error if the requested method does not exist', async () => {
    const { request } = await installSnap();

    const response = await request({
      method: 'foo',
    });

    expect(response).toRespondWithError({
      code: -32601,
      message: 'The method does not exist / is not available.',
      stack: expect.any(String),
      data: {
        method: 'foo',
        cause: null,
      },
    });
  });

  describe('dialog', () => {
    it('shows a dialog with an upload form and displays the files', async () => {
      const { request } = await installSnap();

      const response = request({
        method: 'dialog',
      });

      const ui = await response.getInterface();
      await ui.uploadFile('file-input', MOCK_IMAGE_BYTES, {
        fileName: 'image.svg',
        contentType: 'image/svg+xml',
      });

      expect(await response.getInterface()).toRender(
        <UploadForm
          files={[
            {
              name: 'image.svg',
              contentType: 'image/svg+xml',
              size: MOCK_IMAGE_BYTES.length,
              contents: bytesToBase64(MOCK_IMAGE_BYTES),
            },
          ]}
        />,
      );

      await ui.uploadFile('file-input', MOCK_OTHER_IMAGE_BYTES, {
        fileName: 'other-image.svg',
        contentType: 'image/svg+xml',
      });

      expect(await response.getInterface()).toRender(
        <UploadForm
          files={[
            {
              name: 'image.svg',
              contentType: 'image/svg+xml',
              size: MOCK_IMAGE_BYTES.length,
              contents: bytesToBase64(MOCK_IMAGE_BYTES),
            },
            {
              name: 'other-image.svg',
              contentType: 'image/svg+xml',
              size: MOCK_OTHER_IMAGE_BYTES.length,
              contents: bytesToBase64(MOCK_OTHER_IMAGE_BYTES),
            },
          ]}
        />,
      );
    });

    it('shows the latest uploaded file when submitting the form', async () => {
      const { request } = await installSnap();

      const response = request({
        method: 'dialog',
      });

      const ui = await response.getInterface();
      await ui.uploadFile('file-input', MOCK_IMAGE_BYTES, {
        fileName: 'image.svg',
        contentType: 'image/svg+xml',
      });

      await ui.clickElement('submit-file-upload-form');

      expect(await response.getInterface()).toRender(
        <UploadedFiles
          file={{
            name: 'image.svg',
            contentType: 'image/svg+xml',
            size: MOCK_IMAGE_BYTES.length,
            contents: bytesToBase64(MOCK_IMAGE_BYTES),
          }}
        />,
      );
    });

    it('shows "No files uploaded" when submitting the form without uploading a file', async () => {
      const { request } = await installSnap();

      const response = request({
        method: 'dialog',
      });

      const ui = await response.getInterface();
      await ui.clickElement('submit-file-upload-form');

      expect(await response.getInterface()).toRender(
        <UploadedFiles file={null} />,
      );
    });
  });
});
