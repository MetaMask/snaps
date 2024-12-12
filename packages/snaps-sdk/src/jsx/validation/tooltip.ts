import { boolean, nullable, string } from '@metamask/superstruct';

import type { Describe } from '../../internals';
import { selectiveUnion, typedUnion } from '../../internals';
import type { TooltipElement } from '../components';
import { element } from './component';
import { BoldStruct, ItalicStruct } from './formatting';
import { IconStruct } from './icon';
import { ImageStruct } from './image';
import { LinkStruct } from './link';
import { TextStruct } from './text';

/**
 * A subset of JSX elements that are allowed as children of the Tooltip component.
 * This set should include all text components and the Image.
 */
export const TooltipChildStruct = selectiveUnion((value) => {
  if (typeof value === 'boolean') {
    return boolean();
  }
  return typedUnion([
    TextStruct,
    BoldStruct,
    ItalicStruct,
    LinkStruct,
    ImageStruct,
    IconStruct,
  ]);
});

/**
 * A subset of JSX elements that are allowed as content of the Tooltip component.
 * This set should include all text components.
 */
export const TooltipContentStruct = selectiveUnion((value) => {
  if (typeof value === 'string') {
    return string();
  }
  return typedUnion([
    TextStruct,
    BoldStruct,
    ItalicStruct,
    LinkStruct,
    IconStruct,
  ]);
});

/**
 * A struct for the {@link TooltipElement} type.
 */
export const TooltipStruct: Describe<TooltipElement> = element('Tooltip', {
  children: nullable(TooltipChildStruct),
  content: TooltipContentStruct,
});
