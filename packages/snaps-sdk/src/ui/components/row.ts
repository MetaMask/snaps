import type { Infer } from '@metamask/superstruct';
import { assign, object, string, optional, union } from '@metamask/superstruct';

import { AddressStruct } from './address';
import { ImageStruct } from './image';
import { TextStruct } from './text';
import { enumValue, literal } from '../../internals';
import { LiteralStruct, NodeType } from '../nodes';

export enum RowVariant {
  Default = 'default',
  Critical = 'critical',
  Warning = 'warning',
}

// A subset of components made available to the row
const RowComponentStruct = union([ImageStruct, TextStruct, AddressStruct]);

export const RowStruct = assign(
  LiteralStruct,
  object({
    type: literal(NodeType.Row),
    variant: optional(
      union([
        enumValue(RowVariant.Default),
        enumValue(RowVariant.Critical),
        enumValue(RowVariant.Warning),
      ]),
    ),
    label: string(),
    value: RowComponentStruct,
  }),
);

/**
 * A row node, that renders a row with a label and a value.
 *
 * @property type - The type of the node. Must be the string `row`.
 * @property label - The label for the row.
 * @property value - A sub component to be rendered
 * on one side of the row.
 * @property variant - Optional variant for styling.
 */
export type Row = Infer<typeof RowStruct>;
