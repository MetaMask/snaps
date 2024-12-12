import { optional, string } from '@metamask/superstruct';

import {
  literal,
  nullUnion,
  selectiveUnion,
  typedUnion,
  type Describe,
} from '../../internals';
import type { TextElement } from '../components';
import { children, element } from './component';
import { BoldStruct, ItalicStruct } from './formatting';
import { IconStruct } from './icon';
import { LinkStruct } from './link';

/**
 * A struct for the {@link TextElement} type.
 */
export const TextStruct: Describe<TextElement> = element('Text', {
  children: children([
    selectiveUnion((value) => {
      if (typeof value === 'string') {
        return string();
      }
      return typedUnion([BoldStruct, ItalicStruct, LinkStruct, IconStruct]);
    }),
  ]),
  alignment: optional(
    nullUnion([literal('start'), literal('center'), literal('end')]),
  ),
  color: optional(
    nullUnion([
      literal('default'),
      literal('alternative'),
      literal('muted'),
      literal('error'),
      literal('success'),
      literal('warning'),
    ]),
  ),
  size: optional(nullUnion([literal('sm'), literal('md')])),
});
