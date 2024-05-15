/**
 * The props of the {@link Image} component.
 *
 * @property src - The SVG image to display. This should be an SVG string, and
 * other formats such as PNG and JPEG are not supported directly. You can use
 * the `data:` URL scheme to embed images inside the SVG.
 * @property alt - The alternative text of the image, which describes the image
 * for users who cannot see it.
 */
declare type ImageProps = {
    src: string;
    alt?: string | undefined;
};
/**
 * An image component, which is used to display an image.
 *
 * This component does not accept any children.
 *
 * @param props - The props of the component.
 * @param props.src - The URL of the image to display. This should be an SVG
 * string, and other formats such as PNG and JPEG are not supported directly.
 * You can use the `data:` URL scheme to embed images inside the SVG.
 * @param props.alt - The alternative text of the image, which describes the
 * image for users who cannot see it.
 * @returns An image element.
 * @example
 * <Image src="<svg>...</svg>" alt="An example image" />
 */
export declare const Image: import("../component").SnapComponent<ImageProps, "Image">;
/**
 * An image element.
 *
 * @see Image
 */
export declare type ImageElement = ReturnType<typeof Image>;
export {};
