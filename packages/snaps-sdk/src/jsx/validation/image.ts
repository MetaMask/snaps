import { optional, string } from '@metamask/superstruct';

import type { Describe } from '../../internals';
import { svg } from '../../internals';
import type { ImageElement } from '../components';
import { element } from './component';

/**
 * A struct for the {@link ImageElement} type.
 */
export const ImageStruct: Describe<ImageElement> = element('Image', {
  src: svg(),
  alt: optional(string()),
});
