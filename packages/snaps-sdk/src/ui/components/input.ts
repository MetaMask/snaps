import type { Infer } from 'superstruct';
import { assign, literal, object, optional, string, union } from 'superstruct';

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
        literal(InputTypes.Text),
        literal(InputTypes.Password),
        literal(InputTypes.Number),
        literal(InputTypes.Search),
      ]),
    ),
    placeholder: optional(string()),
    label: optional(string()),
  }),
);

export type Input = Infer<typeof InputStruct>;

/**
 * Create a {@link Input} node.
 *
 * @param args - The node arguments. This can either be a name and an optional variant, value and placeholder or an object
 * with the properties: `inputType`, `value`, `variant`, `placeholder` and `name`.
 * @param args.name - The name for the input.
 * @param args.value - The value of the input.
 * @param args.variant - An optional variant, either `text`, `password`, `number` or `search`.
 * @param args.placeholder - An optional input placeholder.
 * @returns The input node as an object.
 * @example
 * const node = input({ name: 'myInput', });
 * const node = row({ label: 'Address', value: address('0x4bbeeb066ed09b7aed07bf39eee0460dfa261520'), variant: RowVariant.Warning });
 * const node = row('Address', address('0x4bbeeb066ed09b7aed07bf39eee0460dfa261520'));
 * const node = row('Address', address('0x4bbeeb066ed09b7aed07bf39eee0460dfa261520'), RowVariant.Warning);
 */
export const input = createBuilder(NodeType.Input, InputStruct, [
  'name',
  'inputType',
  'placeholder',
  'value',
  'label',
]);
