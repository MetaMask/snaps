import { array, assign, object, string, union } from '@metamask/superstruct';

import { ButtonStruct } from './button';
import { InputStruct } from './input';
import { literal } from '../../internals';
import { NodeStruct, NodeType } from '../nodes';

export const FormComponentStruct = union([InputStruct, ButtonStruct]);

export const FormStruct = assign(
  NodeStruct,
  object({
    type: literal(NodeType.Form),
    children: array(FormComponentStruct),
    name: string(),
  }),
);
