import fetchMock from 'jest-fetch-mock';

import { getImageComponent, getImageData } from './images';

fetchMock.enableMocks();

describe('getImageData', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('returns the image data as a data-string for a PNG image', async () => {
    fetchMock.mockResponse('image data', {
      headers: {
        'Content-Type': 'image/png',
      },
    });

    const imageData = await getImageData('https://example.com/image.png');
    expect(imageData).toMatchInlineSnapshot(
      `"data:image/png;base64,aW1hZ2UgZGF0YQ=="`,
    );
  });

  it('returns the image data as a data-string for a JPEG image', async () => {
    fetchMock.mockResponse('image data', {
      headers: {
        'Content-Type': 'image/jpeg',
      },
    });

    const imageData = await getImageData('https://example.com/image.jpeg');
    expect(imageData).toMatchInlineSnapshot(
      `"data:image/jpeg;base64,aW1hZ2UgZGF0YQ=="`,
    );
  });

  it('throws an error if the image is not a PNG or JPEG image', async () => {
    fetchMock.mockResponse('image data', {
      headers: {
        'Content-Type': 'image/gif',
      },
    });

    await expect(getImageData('https://example.com/image.gif')).rejects.toThrow(
      'Expected image data to be a JPEG or PNG image.',
    );
  });

  it('throws an error if the fetch request fails', async () => {
    fetchMock.mockResponse(async () => ({
      status: 404,
      statusText: 'Not Found',
    }));

    await expect(getImageData('https://example.com/image.gif')).rejects.toThrow(
      'Failed to fetch image data from "https://example.com/image.gif": 404 Not Found',
    );
  });

  it('throws if the Snap does not have the "endowment:network-access" permission', async () => {
    const originalFetch = globalThis.fetch;

    // @ts-expect-error - `fetch` is not optional.
    globalThis.fetch = undefined;

    await expect(getImageData('https://example.com/image.png')).rejects.toThrow(
      'Failed to fetch image data from "https://example.com/image.png": Using this function requires the "endowment:network-access" permission.',
    );

    // eslint-disable-next-line require-atomic-updates
    globalThis.fetch = originalFetch;
  });
});

describe('getImageComponent', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('returns the image data as an image component', async () => {
    fetchMock.mockResponse('image data', {
      headers: {
        'Content-Type': 'image/png',
      },
    });

    const result = await getImageComponent('https://example.com/image.png', {
      width: 100,
      height: 100,
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "type": "image",
        "value": "<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><image width="100" height="100" href="data:image/png;base64,aW1hZ2UgZGF0YQ==" /></svg>",
      }
    `);
  });

  it('returns the image data as an image component with only a width', async () => {
    fetchMock.mockResponse('image data', {
      headers: {
        'Content-Type': 'image/png',
      },
    });

    const result = await getImageComponent('https://example.com/image.png', {
      width: 100,
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "type": "image",
        "value": "<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><image width="100" height="100" href="data:image/png;base64,aW1hZ2UgZGF0YQ==" /></svg>",
      }
    `);
  });

  it.each([
    true,
    false,
    null,
    undefined,
    0,
    -1,
    '1',
    '100',
    {},
    [],
    () => undefined,
  ])('throws an error if the width is invalid', async (width) => {
    await expect(
      getImageComponent('https://example.com/image.png', {
        // @ts-expect-error - `width` is invalid.
        width,
      }),
    ).rejects.toThrow('Expected width to be a number greater than 0.');
  });

  it.each([
    true,
    false,
    null,
    undefined,
    0,
    -1,
    '1',
    '100',
    {},
    [],
    () => undefined,
  ])('throws an error if the height is invalid', async (height) => {
    await expect(
      getImageComponent('https://example.com/image.png', {
        // @ts-expect-error - `height` is invalid.
        height,
      }),
    ).rejects.toThrow('Expected width to be a number greater than 0.');
  });
});
