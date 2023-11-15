import type { Infer } from 'superstruct';
import {
  assign,
  literal,
  object,
  lazy,
  string,
  optional,
  enums,
  union,
} from 'superstruct';

import { createBuilder } from '../builder';
import { LiteralStruct, NodeType } from '../nodes';
import { AddressStruct } from './address';
import { DoubleValueStruct } from './doubleValue';
import { ImageStruct } from './image';
import { TextStruct } from './text';

export enum RowVariant {
  Default = 'default',
  Critical = 'critical',
  Warning = 'warning',
}

export const RowComponentStruct = union([
  ImageStruct,
  TextStruct,
  AddressStruct,
  DoubleValueStruct,
]);

export const RowStruct = assign(
  LiteralStruct,
  object({
    type: literal(NodeType.Row),
    // TODO: Use enumValue() or similar if needed?
    variant: optional(enums(Object.values(RowVariant))),
    label: string(),
    value: lazy(() => RowComponentStruct),
  }),
);

export type Row = Infer<typeof RowStruct>;

export const row = createBuilder(NodeType.Row, RowStruct, [
  'label',
  'value',
  'variant',
]);
