import type { Infer } from '@metamask/superstruct';
import { array, assign, object, string, union } from '@metamask/superstruct';

import { ButtonStruct } from './button';
import { InputStruct } from './input';
import { literal } from '../../internals';
import { NodeStruct, NodeType } from '../nodes';

export const FormComponentStruct = union([InputStruct, ButtonStruct]);

/**
 * The subset of nodes allowed as children in the {@link Form} node.
 */
export type FormComponent = Infer<typeof FormComponentStruct>;

export const FormStruct = assign(
  NodeStruct,
  object({
    type: literal(NodeType.Form),
    children: array(FormComponentStruct),
    name: string(),
  }),
);

/**
 * A form node that takes children {@link FormComponent} nodes and renders a form.
 *
 * @property type - The type of the node. Must be the string `form`.
 * @property children - The children of the node. Only {@link FormComponent} nodes are allowed.
 * @property name - The form name used to identify it.
 */
export type Form = Infer<typeof FormStruct>;
