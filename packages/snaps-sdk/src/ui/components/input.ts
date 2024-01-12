import type { Infer } from 'superstruct';
import { assign, literal, object, optional, string, union } from 'superstruct';

import { enumValue } from '../../internals';
import { createBuilder } from '../builder';
import { LiteralStruct, NodeType } from '../nodes';

/**
 * This replicates the available input types from the metamask extension.
 * https://github.com/MetaMask/metamask-extension/develop/ui/components/component-library/input/input.constants.js
 */
export enum InputTypes {
  /* eslint-disable @typescript-eslint/no-shadow */
  Text = 'text',
  Number = 'number',
  /* eslint-enable @typescript-eslint/no-shadow */
  Password = 'password',
  Search = 'search',
}

export const InputStruct = assign(
  LiteralStruct,
  object({
    type: literal(NodeType.Input),
    value: optional(string()),
    name: string(),
    inputType: optional(
      union([
        enumValue(InputTypes.Text),
        enumValue(InputTypes.Password),
        enumValue(InputTypes.Number),
        enumValue(InputTypes.Search),
      ]),
    ),
    placeholder: optional(string()),
    label: optional(string()),
  }),
);

/**
 * Am input node, that renders an input.
 *
 * @property type - The type of the node, must be the string 'input'.
 * @property name - The name for the input.
 * @property value - The value of the input.
 * @property inputType - An optional type, either `text`, `password`, `number` or `search`.
 * @property placeholder - An optional input placeholder.
 * @property label - An optional input label.
 */
export type Input = Infer<typeof InputStruct>;

/**
 * Create a {@link Input} node.
 *
 * @param args - The node arguments. This can either be a name and an optional variant, value and placeholder or an object
 * with the properties: `inputType`, `value`, `variant`, `placeholder` and `name`.
 * @param args.name - The name for the input.
 * @param args.value - The value of the input.
 * @param args.inputType - An optional type, either `text`, `password`, `number` or `search`.
 * @param args.placeholder - An optional input placeholder.
 * @param args.label - An optional input label.
 * @returns The input node as an object.
 * @example
 * const node = input({ name: 'myInput', });
 * const node = input({name: 'myInput', value: 'myValue', inputType: InputTypes.Password, placeholder: 'placeholder'})
 */
export const input = createBuilder(NodeType.Input, InputStruct, [
  'name',
  'inputType',
  'placeholder',
  'value',
  'label',
]);
