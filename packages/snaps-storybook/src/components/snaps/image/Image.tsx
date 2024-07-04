import { Image as ChakraImage } from '@chakra-ui/react';
import type { ImageProps } from '@metamask/snaps-sdk/jsx';
import type { FunctionComponent } from 'react';

import type { RenderProps } from '../../Renderer';
import { getImage } from '../utils';

/**
 * The image component, which is used to display SVG images.
 *
 * @param props - The props of the component.
 * @param props.src - The image to display. This must be an SVG string.
 * @param props.alt - The alternative text for the image.
 * @returns The image element.
 */
export const Image: FunctionComponent<RenderProps<ImageProps>> = ({
  src,
  alt,
}) => {
  return <ChakraImage src={getImage(src)} alt={alt} />;
};
