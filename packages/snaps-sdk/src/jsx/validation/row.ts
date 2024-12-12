import { optional, string } from '@metamask/superstruct';

import { literal, nullUnion, typedUnion, type Describe } from '../../internals';
import type { RowElement } from '../components';
import { AddressStruct } from './address';
import { element } from './component';
import { ImageStruct } from './image';
import { LinkStruct } from './link';
import { TextStruct } from './text';
import { ValueStruct } from './value';

/**
 * A struct for the {@link RowElement} type.
 */
export const RowStruct: Describe<RowElement> = element('Row', {
  label: string(),
  children: typedUnion([
    AddressStruct,
    ImageStruct,
    TextStruct,
    ValueStruct,
    LinkStruct,
  ]),
  variant: optional(
    nullUnion([literal('default'), literal('warning'), literal('critical')]),
  ),
  tooltip: optional(string()),
});
