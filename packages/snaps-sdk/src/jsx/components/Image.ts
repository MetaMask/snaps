import type { BorderRadius } from './utils';
import { createSnapComponent } from '../component';

/**
 * The props of the {@link Image} component.
 *
 * @property src - The SVG image to display. This should be an SVG string, and
 * other formats such as PNG and JPEG are not supported directly. You can use
 * the `data:` URL scheme to embed images inside the SVG.
 * @property alt - The alternative text of the image, which describes the image
 * for users who cannot see it.
 * @category Component Props
 */
type ImageProps = {
  src: string;
  alt?: string | undefined;
  borderRadius?: BorderRadius | undefined;
  height?: number | undefined;
  width?: number | undefined;
};

const TYPE = 'Image';

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
 * @param props.borderRadius - The border radius applied to the image.
 * @param props.width - The width of the image.
 * @param props.height - The height of the image.
 * @returns An image element.
 * @example
 * <Image src="<svg>...</svg>" alt="An example image" />
 * @category Components
 */
export const Image = createSnapComponent<ImageProps, typeof TYPE>(TYPE);

/**
 * An image element.
 *
 * @see {@link Image}
 * @category Elements
 */
export type ImageElement = ReturnType<typeof Image>;
