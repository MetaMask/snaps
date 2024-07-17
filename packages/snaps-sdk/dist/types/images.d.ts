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
export declare function getImageData(url: string, options?: RequestInit): Promise<string>;
/**
 * Options for getting an SVG image element from a URL.
 *
 * @property width - The width of the image.
 * @property height - The height of the image. If this is not provided, the
 * width will be used as the height.
 * @property request - The options to use when fetching the image data. This is
 * passed directly to `fetch`.
 */
export declare type ImageOptions = {
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
export declare function getImageComponent(url: string, { width, height, request }: ImageOptions): Promise<{
    value: string;
    type: import("./ui").NodeType.Image;
}>;
