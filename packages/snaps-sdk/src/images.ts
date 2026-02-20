import { assert, bytesToBase64 } from '@metamask/utils';

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
