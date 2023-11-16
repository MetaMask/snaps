import type { Infer } from 'superstruct';
import { assign, literal, object, string, optional, union } from 'superstruct';

import { enumValue } from '../../internals';
import { createBuilder } from '../builder';
import { LiteralStruct, NodeType } from '../nodes';
import { AddressStruct } from './address';
import { ImageStruct } from './image';
import { TextStruct } from './text';

export enum RowVariant {
  Default = 'default',
  Critical = 'critical',
  Warning = 'warning',
}

// A subset of components made available to the row
export const RowComponentStruct = union([
  ImageStruct,
  TextStruct,
  AddressStruct,
]);

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

export type Row = Infer<typeof RowStruct>;

export const row = createBuilder(NodeType.Row, RowStruct, [
  'label',
  'value',
  'variant',
]);
