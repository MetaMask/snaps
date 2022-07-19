/* eslint-disable @typescript-eslint/no-use-before-define */

import {
  array,
  Infer,
  literal,
  object,
  optional,
  string,
  union,
  lazy,
  Struct,
} from 'superstruct';

// Cannot be inferred because it indirectly references itself.
export type Fragment = {
  type: 'fragment';
  children: Element[];
};

export const FragmentStruct = object({
  type: literal('fragment'),
  children: lazy(() => array(ElementStruct)),
});

export type Input = Infer<typeof InputStruct>;
export const InputStruct = object({
  type: literal('input'),
  placeholder: optional(string()),
});

// Cannot be inferred because it indirectly references itself.
export type Row = {
  type: 'row';
  children: Element[];
};

export const RowStruct = object({
  type: literal('row'),
  children: lazy(() => array(ElementStruct)),
});

export type Text = Infer<typeof TextStruct>;
export const TextStruct = object({
  type: literal('text'),
  value: string(),
});

// Cannot be inferred because it indirectly references itself.
export type Element = Fragment | Input | Row | Text;
export const ElementStruct: Struct<Element> = union([
  FragmentStruct,
  InputStruct,
  RowStruct,
  TextStruct,
]);
