import type { Infer } from 'superstruct';
import { array, assign, literal, object, string, union } from 'superstruct';

import { createBuilder } from '../builder';
import { NodeStruct, NodeType } from '../nodes';
import { ButtonStruct } from './button';
import { InputStruct } from './input';

export const FormComponentStruct = union([InputStruct, ButtonStruct]);

export type FormComponent = Infer<typeof FormComponentStruct>;

export const FormStruct = assign(
  NodeStruct,
  object({
    type: literal(NodeType.Form),
    children: array(FormComponentStruct),
    name: string(),
  }),
);

export type Form = Infer<typeof FormStruct>;

export const form = createBuilder(NodeType.Form, FormStruct, [
  'name',
  'children',
]);
