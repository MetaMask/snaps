import { string } from '@metamask/superstruct';

import type { Describe } from '../../internals';
import type { LinkElement } from '../components';
import { AddressStruct } from './address';
import { children, element } from './component';
import { FormattingStruct } from './formatting';
import { IconStruct } from './icon';
import { ImageStruct } from './image';

/**
 * A struct for the {@link LinkElement} type.
 */
export const LinkStruct: Describe<LinkElement> = element('Link', {
  href: string(),
  children: children([
    FormattingStruct,
    string(),
    IconStruct,
    ImageStruct,
    AddressStruct,
  ]),
});
