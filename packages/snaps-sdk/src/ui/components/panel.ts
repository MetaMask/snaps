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

    children: array(
      lazy(
        /* istanbul ignore next */
        () =>
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          ComponentStruct,
      ),
    ),
  }),
);

/**
 * @internal
 */
export const PanelStruct: Struct<Panel> = assign(
  ParentStruct,
  object({
    type: literal(NodeType.Panel),
  }),
);

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
