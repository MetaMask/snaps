import type { Infer, Struct } from '@metamask/superstruct';
import { array, assign, lazy, object } from '@metamask/superstruct';

import { AddressStruct } from './address';
import { ButtonStruct } from './button';
import { CopyableStruct } from './copyable';
import { DividerStruct } from './divider';
import { FormStruct } from './form';
import { HeadingStruct } from './heading';
import { ImageStruct } from './image';
import { InputStruct } from './input';
import { RowStruct } from './row';
import { SpinnerStruct } from './spinner';
import { TextStruct } from './text';
import { typedUnion, literal } from '../../internals';
import { NodeStruct, NodeType } from '../nodes';

/**
 * @internal
 */
export const ParentStruct = assign(
  NodeStruct,
  object({
    // This node references itself indirectly, so we need to use `lazy()`.
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    children: array(lazy(() => ComponentStruct)),
  }),
);

/**
 * A node which supports child nodes. This is used for nodes that render their
 * children, such as {@link Panel}.
 *
 * @property type - The type of the node.
 * @property children - The children of the node
 * @internal
 */
export type Parent = Infer<typeof ParentStruct>;

/**
 * @internal
 */
export const PanelStruct: Struct<Panel> = assign(
  ParentStruct,
  object({
    type: literal(NodeType.Panel),
  }),
);

/**
 * A panel node, which renders its children.
 *
 * @property type - The type of the node, must be the string 'text'.
 * @property value - The text content of the node, either as plain text, or as a
 * markdown string.
 */
// This node references itself indirectly, so it cannot be inferred.
export type Panel = {
  type: NodeType.Panel;
  children: Component[];
};

// This is defined separately from `Component` to avoid circular dependencies.
export const ComponentStruct = typedUnion([
  CopyableStruct,
  DividerStruct,
  HeadingStruct,
  ImageStruct,
  PanelStruct,
  SpinnerStruct,
  TextStruct,
  RowStruct,
  AddressStruct,
  InputStruct,
  FormStruct,
  ButtonStruct,
]);

/**
 * All supported component types.
 */
export type Component = Infer<typeof ComponentStruct>;
