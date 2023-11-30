import { assert, bytesToBase64 } from '@metamask/utils';

import { image } from './ui';

/**
 * Get raw image data from a URL.
 *
 * @param url - The URL to get the image data from.
 * @param options - The options to use when fetching the image data. This is
 * passed directly to `fetch`.
 * @returns A promise that resolves to the image data as a blob.
 */
async function getRawImageData(url: string, options?: RequestInit) {
  if (typeof fetch !== 'function') {
    throw new Error(
      `Failed to fetch image data from "${url}": Using this function requires the "endowment:network-access" permission.`,
    );
  }

  return fetch(url, options).then(async (response) => {
    if (!response.ok) {
      throw new Error(
        `Failed to fetch image data from "${url}": ${response.status} ${response.statusText}`,
      );
    }

    const blob = await response.blob();
    assert(
      blob.type === 'image/jpeg' || blob.type === 'image/png',
      'Expected image data to be a JPEG or PNG image.',
    );

    return blob;
  });
}

/**
 * Get image data as data-string from a URL. This is useful for embedding images
 * inside of SVGs. Only JPEG and PNG images are supported.
 *
 * Note: This function uses `fetch` to get the image data. This means that using
 * it requires the `endowment:network-access` permission.
 *
 * @example
 * const imageData = await getImageData('https://cataas.com/cat');
 * const svg = `
 *   <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
 *     <image href="${imageData}" />
 *   </svg>
 * `;
 *
 * // Render the SVG in a Snap UI.
 * const ui = image(svg);
 * @param url - The URL to get the image data from.
 * @param options - The options to use when fetching the image data. This is
 * passed directly to `fetch`.
 * @returns A promise that resolves to the image data as a data-string.
 */
export async function getImageData(url: string, options?: RequestInit) {
  const blob = await getRawImageData(url, options);
  const bytes = new Uint8Array(await blob.arrayBuffer());

  return `data:${blob.type};base64,${bytesToBase64(bytes)}`;
}

/**
 * Options for getting an SVG image element from a URL.
 *
 * @property width - The width of the image.
 * @property height - The height of the image. If this is not provided, the
 * width will be used as the height.
 * @property request - The options to use when fetching the image data. This is
 * passed directly to `fetch`.
 */
export type ImageOptions = {
  width: number;
  height?: number;
  request?: RequestInit;
};

/**
 * Get an image component from a URL. This is useful for embedding images inside
 * Snap UIs. Only JPEG and PNG images are supported.
 *
 * Note: This function uses `fetch` to get the image data. This means that using
 * it requires the `endowment:network-access` permission.
 *
 * @example
 * const component = await getImage('https://cataas.com/cat');
 *
 * return await snap.request({
 *   method: 'snap_dialog',
 *   params: {
 *     type: 'alert',
 *     content: panel([
 *       component,
 *     ]),
 *   },
 * });
 * @param url - The URL to get the image data from.
 * @param options - The options to use when fetching and rendering the image.
 * @param options.width - The width of the image.
 * @param options.height - The height of the image. If this is not provided, the
 * width will be used as the height.
 * @param options.request - The options to use when fetching the image data.
 * This is passed directly to `fetch`.
 * @returns A promise that resolves to the image data as an image component.
 */
export async function getImageComponent(
  url: string,
  { width, height = width, request }: ImageOptions,
) {
  assert(
    typeof width === 'number' && width > 0,
    'Expected width to be a number greater than 0.',
  );

  assert(
    typeof height === 'number' && height > 0,
    'Expected height to be a number greater than 0.',
  );

  const imageData = await getImageData(url, request);
  const size = `width="${width}" height="${height}"`;

  return image(
    `<svg ${size.trim()} xmlns="http://www.w3.org/2000/svg"><image ${size.trim()} href="${imageData}" /></svg>`,
  );
}
