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
});

describe('getImage', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('returns the image data as an image component', async () => {
    fetchMock.mockResponse('image data', {
      headers: {
        'Content-Type': 'image/png',
      },
    });

    const result = await getImageComponent('https://example.com/image.png');
    expect(result).toMatchInlineSnapshot(`
      {
        "type": "image",
        "value": "<svg  xmlns="http://www.w3.org/2000/svg"><image href="data:image/png;base64,aW1hZ2UgZGF0YQ==" /></svg>",
      }
    `);
  });

  it('returns the image data as an image component with width and height', async () => {
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
        "value": "<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><image href="data:image/png;base64,aW1hZ2UgZGF0YQ==" /></svg>",
      }
    `);
  });
});
