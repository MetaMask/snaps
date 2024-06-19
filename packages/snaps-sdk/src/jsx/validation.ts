import {
  hasProperty,
  HexChecksumAddressStruct,
  isPlainObject,
  JsonStruct,
} from '@metamask/utils';
import type { Struct } from 'superstruct';
import {
  is,
  boolean,
  optional,
  array,
  lazy,
  nullable,
  number,
  object,
  record,
  string,
  tuple,
} from 'superstruct';
import type { ObjectSchema } from 'superstruct/dist/utils';

import type { Describe } from '../internals';
import { literal, nullUnion, svg } from '../internals';
import type { EmptyObject } from '../types';
import type {
  GenericSnapElement,
  JsonObject,
  Key,
  MaybeArray,
  Nestable,
  SnapElement,
  StringElement,
} from './component';
import type {
  AddressElement,
  BoldElement,
  BoxElement,
  ButtonElement,
  CheckboxElement,
  CopyableElement,
  DividerElement,
  DropdownElement,
  OptionElement,
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
  TooltipElement,
  ValueElement,
  FileInputElement,
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
 * A helper function for creating a struct for a {@link Nestable} type.
 *
 * @param struct - The struct for the type to test.
 * @returns The struct for the nestable type.
 */
function nestable<Type, Schema>(struct: Struct<Type, Schema>) {
  const nestableStruct: Struct<Nestable<Type>> = nullUnion([
    struct,
    array(lazy(() => nestableStruct)),
  ]);

  return nestableStruct;
}

/**
 * A helper function for creating a struct for a {@link MaybeArray} type.
 *
 * @param struct - The struct for the maybe array type.
 * @returns The struct for the maybe array type.
 */
function maybeArray<Type, Schema>(
  struct: Struct<Type, Schema>,
): Struct<MaybeArray<Type>, any> {
  return nestable(struct);
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
  type: optional(nullUnion([literal('button'), literal('submit')])),
  variant: optional(nullUnion([literal('primary'), literal('destructive')])),
  disabled: optional(boolean()),
});

/**
 * A struct for the {@link CheckboxElement} type.
 */
export const CheckboxStruct: Describe<CheckboxElement> = element('Checkbox', {
  name: string(),
  value: optional(boolean()),
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
 * A struct for the {@link OptionElement} type.
 */
export const OptionStruct: Describe<OptionElement> = element('Option', {
  value: string(),
  children: string(),
});

/**
 * A struct for the {@link DropdownElement} type.
 */
export const DropdownStruct: Describe<DropdownElement> = element('Dropdown', {
  name: string(),
  value: optional(string()),
  children: maybeArray(OptionStruct),
});

/**
 * A struct for the {@link FileInputElement} type.
 */
export const FileInputStruct: Describe<FileInputElement> = element(
  'FileInput',
  {
    name: string(),
    accept: nullUnion([optional(array(string()))]),
    compact: optional(boolean()),
  },
);

/**
 * A struct for the {@link FieldElement} type.
 */
export const FieldStruct: Describe<FieldElement> = element('Field', {
  label: optional(string()),
  error: optional(string()),
  children: nullUnion([
    tuple([InputStruct, ButtonStruct]),
    DropdownStruct,
    FileInputStruct,
    InputStruct,
  ]),
});

/**
 * A struct for the {@link FormElement} type.
 */
export const FormStruct: Describe<FormElement> = element('Form', {
  children: maybeArray(
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    nullable(nullUnion([FieldStruct, lazy(() => BoxChildStruct)])),
  ) as unknown as Struct<MaybeArray<GenericSnapElement | null>, null>,
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
        lazy(() => ItalicStruct) as unknown as Struct<
          SnapElement<JsonObject, 'Italic'>
        >,
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
        lazy(() => BoldStruct) as unknown as Struct<
          SnapElement<JsonObject, 'Bold'>
        >,
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
  address: HexChecksumAddressStruct,
});

/**
 * A struct for the {@link BoxElement} type.
 */
export const BoxStruct: Describe<BoxElement> = element('Box', {
  children: maybeArray(
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    nullable(lazy(() => BoxChildStruct)),
  ) as unknown as Struct<MaybeArray<GenericSnapElement | null>, null>,
  direction: optional(nullUnion([literal('horizontal'), literal('vertical')])),
  alignment: optional(
    nullUnion([
      literal('start'),
      literal('center'),
      literal('end'),
      literal('space-between'),
      literal('space-around'),
    ]),
  ),
});

/**
 * A struct for the {@link CopyableElement} type.
 */
export const CopyableStruct: Describe<CopyableElement> = element('Copyable', {
  value: string(),
  sensitive: optional(boolean()),
});

/**
 * A struct for the {@link DividerElement} type.
 */
export const DividerStruct: Describe<DividerElement> = element('Divider');

/**
 * A struct for the {@link ValueElement} type.
 */
export const ValueStruct: Describe<ValueElement> = element('Value', {
  value: string(),
  extra: string(),
});

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
  src: svg(),
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
  alignment: optional(
    nullUnion([literal('start'), literal('center'), literal('end')]),
  ),
});

/**
 * A subset of JSX elements that are allowed as children of the Tooltip component.
 * This set should include all text components and the Image.
 */
export const TooltipChildStruct = nullUnion([
  TextStruct,
  BoldStruct,
  ItalicStruct,
  LinkStruct,
  ImageStruct,
]);

/**
 * A subset of JSX elements that are allowed as content of the Tooltip component.
 * This set should include all text components.
 */
export const TooltipContentStruct = nullUnion([
  TextStruct,
  BoldStruct,
  ItalicStruct,
  LinkStruct,
  string(),
]);

/**
 * A struct for the {@link TooltipElement} type.
 */
export const TooltipStruct: Describe<TooltipElement> = element('Tooltip', {
  children: nullable(TooltipChildStruct),
  content: TooltipContentStruct,
});

/**
 * A struct for the {@link RowElement} type.
 */
export const RowStruct: Describe<RowElement> = element('Row', {
  label: string(),
  children: nullUnion([AddressStruct, ImageStruct, TextStruct, ValueStruct]),
  variant: optional(
    nullUnion([literal('default'), literal('warning'), literal('critical')]),
  ),
  tooltip: optional(string()),
});

/**
 * A struct for the {@link SpinnerElement} type.
 */
export const SpinnerStruct: Describe<SpinnerElement> = element('Spinner');

/**
 * A subset of JSX elements that are allowed as children of the Box component.
 * This set includes all components, except components that need to be nested in
 * another component (e.g., Field must be contained in a Form).
 */
export const BoxChildStruct = nullUnion([
  AddressStruct,
  BoldStruct,
  BoxStruct,
  ButtonStruct,
  CopyableStruct,
  DividerStruct,
  DropdownStruct,
  FileInputStruct,
  FormStruct,
  HeadingStruct,
  InputStruct,
  ImageStruct,
  ItalicStruct,
  LinkStruct,
  RowStruct,
  SpinnerStruct,
  TextStruct,
  TooltipStruct,
  CheckboxStruct,
]);

/**
 * For now, the allowed JSX elements at the root are the same as the allowed
 * children of the Box component.
 */
export const RootJSXElementStruct = BoxChildStruct;

/**
 * A struct for the {@link JSXElement} type.
 */
export const JSXElementStruct: Describe<JSXElement> = nullUnion([
  ButtonStruct,
  InputStruct,
  FileInputStruct,
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
  DropdownStruct,
  OptionStruct,
  ValueStruct,
  TooltipStruct,
  CheckboxStruct,
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
  if (!isJSXElement(value)) {
    throw new Error(
      `Expected a JSX element, but received ${JSON.stringify(
        value,
      )}. Please refer to the documentation for the supported JSX elements and their props.`,
    );
  }
}
