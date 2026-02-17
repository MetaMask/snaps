import type { Infer } from '@metamask/superstruct';
import {
  assign,
  boolean,
  object,
  optional,
  string,
} from '@metamask/superstruct';

import { literal } from '../../internals';
import { LiteralStruct, NodeType } from '../nodes';

export const CopyableStruct = assign(
  LiteralStruct,
  object({
    type: literal(NodeType.Copyable),
    value: string(),
    sensitive: optional(boolean()),
  }),
);

/**
 * Text that can be copied to the clipboard. It can optionally be marked as
 * sensitive, in which case it will only be displayed to the user after clicking
 * on the component.
 *
 * @property type - The type of the node. Must be the string `copyable`.
 * @property value - The text to be copied.
 * @property sensitive - Whether the value is sensitive or not. Sensitive values
 * are only displayed to the user after clicking on the component. Defaults to
 * false.
 */
export type Copyable = Infer<typeof CopyableStruct>;
