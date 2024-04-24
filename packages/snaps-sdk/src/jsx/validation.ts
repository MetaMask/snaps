import {
  assertStruct,
  hasProperty,
  isPlainObject,
  JsonStruct,
  StrictHexStruct,
} from '@metamask/utils';
import type { Struct } from 'superstruct';
import {
  is,
  boolean,
  defaulted,
  optional,
  tuple,
  array,
  lazy,
  nullable,
  number,
  object,
  record,
  string,
} from 'superstruct';
import type { ObjectSchema } from 'superstruct/dist/utils';

import type { Describe } from '../internals';
import { literal, nullUnion } from '../internals';
import type { EmptyObject } from '../types';
import type {
  GenericSnapElement,
  Key,
  MaybeArray,
  StringElement,
} from './component';
import type {
  AddressElement,
  BoldElement,
  BoxElement,
  ButtonElement,
  CopyableElement,
  DividerElement,
  FieldElement,
  FormElement,
  HeadingElement,
  ImageElement,
  InputElement,
  ItalicElement,
  JSXElement,
  LinkElement,
  RowElement,
  SpinnerElement,
  StandardFormattingElement,
  TextElement,
} from './components';

/**
 * A struct for the {@link Key} type.
 */
export const KeyStruct: Describe<Key> = nullUnion([string(), number()]);

/**
 * A struct for the {@link StringElement} type.
 */
export const StringElementStruct: Describe<StringElement> = maybeArray(
  string(),
);

/**
 * A struct for the {@link GenericSnapElement} type.
 */
export const ElementStruct: Describe<GenericSnapElement> = object({
  type: string(),
  props: record(string(), JsonStruct),
  key: nullable(KeyStruct),
});

/**
 * A helper function for creating a struct for a {@link MaybeArray} type.
 *
 * @param struct - The struct for the maybe array type.
 * @returns The struct for the maybe array type.
 */
function maybeArray<Type, Schema>(
  struct: Struct<Type, Schema>,
): Struct<MaybeArray<Type>, any> {
  return nullUnion([struct, array(struct)]);
}

/**
 * A helper function for creating a struct for a JSX element.
 *
 * @param name - The name of the element.
 * @param props - The props of the element.
 * @returns The struct for the element.
 */
function element<Name extends string, Props extends ObjectSchema = EmptyObject>(
  name: Name,
  props: Props = {} as Props,
) {
  return object({
    type: literal(name) as unknown as Struct<Name, Name>,
    props: object(props),
    key: nullable(KeyStruct),
  });
}

/**
 * A struct for the {@link ButtonElement} type.
 */
export const ButtonStruct: Describe<ButtonElement> = element('Button', {
  children: StringElementStruct,
  name: optional(string()),
  type: defaulted(
    optional(nullUnion([literal('button'), literal('submit')])),
    'button',
  ),
  variant: defaulted(
    optional(nullUnion([literal('primary'), literal('destructive')])),
    'primary',
  ),
  disabled: defaulted(optional(boolean()), 'false'),
});

/**
 * A struct for the {@link InputElement} type.
 */
export const InputStruct: Describe<InputElement> = element('Input', {
  name: string(),
  type: optional(
    nullUnion([literal('text'), literal('password'), literal('number')]),
  ),
  value: optional(string()),
  placeholder: optional(string()),
});

/**
 * A struct for the {@link FieldElement} type.
 */
export const FieldStruct: Describe<FieldElement> = element('Field', {
  label: optional(string()),
  error: optional(string()),
  children: nullUnion([tuple([InputStruct, ButtonStruct]), InputStruct]),
});

/**
 * A struct for the {@link FormElement} type.
 */
export const FormStruct: Describe<FormElement> = element('Form', {
  children: nullUnion([FieldStruct, array(FieldStruct)]),
  name: string(),
});

/**
 * A struct for the {@link BoldElement} type.
 */
export const BoldStruct: Describe<BoldElement> = element('Bold', {
  children: maybeArray(
    nullable(
      nullUnion([
        string(),
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        lazy(() => ItalicStruct) as unknown as Struct<{ type: 'Italic' }>,
      ]),
    ),
  ),
});

/**
 * A struct for the {@link ItalicElement} type.
 */
export const ItalicStruct: Describe<ItalicElement> = element('Italic', {
  children: maybeArray(
    nullable(
      nullUnion([
        string(),
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        lazy(() => BoldStruct) as unknown as Struct<{ type: 'Bold' }>,
      ]),
    ),
  ),
});

export const FormattingStruct: Describe<StandardFormattingElement> = nullUnion([
  BoldStruct,
  ItalicStruct,
]);

/**
 * A struct for the {@link AddressElement} type.
 */
export const AddressStruct: Describe<AddressElement> = element('Address', {
  address: StrictHexStruct,
});

/**
 * A struct for the {@link BoxElement} type.
 */
export const BoxStruct: Describe<BoxElement> = element('Box', {
  children: maybeArray(
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    nullable(lazy(() => JSXElementStruct)),
  ) as unknown as Struct<MaybeArray<GenericSnapElement | null>, null>,
});

/**
 * A struct for the {@link CopyableElement} type.
 */
export const CopyableStruct: Describe<CopyableElement> = element('Copyable', {
  value: string(),
  sensitive: defaulted(optional(boolean()), false),
});

/**
 * A struct for the {@link DividerElement} type.
 */
export const DividerStruct: Describe<DividerElement> = element('Divider');

/**
 * A struct for the {@link HeadingElement} type.
 */
export const HeadingStruct: Describe<HeadingElement> = element('Heading', {
  children: StringElementStruct,
});

/**
 * A struct for the {@link ImageElement} type.
 */
export const ImageStruct: Describe<ImageElement> = element('Image', {
  src: string(),
  alt: optional(string()),
});

/**
 * A struct for the {@link LinkElement} type.
 */
export const LinkStruct: Describe<LinkElement> = element('Link', {
  href: string(),
  children: maybeArray(nullable(nullUnion([FormattingStruct, string()]))),
});

/**
 * A struct for the {@link TextElement} type.
 */
export const TextStruct: Describe<TextElement> = element('Text', {
  children: maybeArray(
    nullable(nullUnion([string(), BoldStruct, ItalicStruct, LinkStruct])),
  ),
});

/**
 * A struct for the {@link RowElement} type.
 */
export const RowStruct: Describe<RowElement> = element('Row', {
  label: string(),
  children: nullUnion([AddressStruct, ImageStruct, TextStruct]),
  variant: defaulted(
    optional(
      nullUnion([literal('default'), literal('warning'), literal('error')]),
    ),
    'default',
  ),
});

/**
 * A struct for the {@link SpinnerElement} type.
 */
export const SpinnerStruct: Describe<SpinnerElement> = element('Spinner');

/**
 * A struct for the {@link JSXElement} type.
 */
export const JSXElementStruct: Describe<JSXElement> = nullUnion([
  ButtonStruct,
  InputStruct,
  FieldStruct,
  FormStruct,
  BoldStruct,
  ItalicStruct,
  AddressStruct,
  BoxStruct,
  CopyableStruct,
  DividerStruct,
  HeadingStruct,
  ImageStruct,
  LinkStruct,
  RowStruct,
  SpinnerStruct,
  TextStruct,
]);

/**
 * Check if a value is a JSX element.
 *
 * @param value - The value to check.
 * @returns True if the value is a JSX element, false otherwise.
 */
export function isJSXElement(value: unknown): value is JSXElement {
  return is(value, JSXElementStruct);
}

/**
 * Check if a value is a JSX element, without validating all of its contents.
 * This is useful when you want to validate the structure of a value, but not
 * all the children.
 *
 * This should only be used when you are sure that the value is safe to use,
 * i.e., after using {@link isJSXElement}.
 *
 * @param value - The value to check.
 * @returns True if the value is a JSX element, false otherwise.
 */
export function isJSXElementUnsafe(value: unknown): value is JSXElement {
  return (
    isPlainObject(value) &&
    hasProperty(value, 'type') &&
    hasProperty(value, 'props') &&
    hasProperty(value, 'key')
  );
}

/**
 * Assert that a value is a JSX element.
 *
 * @param value - The value to check.
 * @throws If the value is not a JSX element.
 */
export function assertJSXElement(value: unknown): asserts value is JSXElement {
  // TODO: We should use the error parsing utils from `snaps-utils` to improve
  // the error messages. It currently includes colours and potentially other
  // formatting that we might not want to include in the SDK.
  assertStruct(value, JSXElementStruct, 'Invalid JSX element');
}
