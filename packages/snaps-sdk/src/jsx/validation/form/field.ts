import type { Struct } from '@metamask/superstruct';
import { lazy, optional, string, tuple } from '@metamask/superstruct';

import { BoxChildStruct } from '..';
import type { Describe } from '../../../internals';
import { nullUnion, selectiveUnion, typedUnion } from '../../../internals';
import type { GenericSnapChildren } from '../../component';
import type {
  CheckboxElement,
  DropdownElement,
  FieldElement,
  FileInputElement,
  InputElement,
  RadioGroupElement,
  SelectorElement,
} from '../../components';
import { element, singleChild } from '../component';
import { CheckboxStruct } from './checkbox';
import { DropdownStruct } from './dropdown';
import { FileInputStruct } from './file-input';
import { InputStruct } from './input';
import { RadioGroupStruct } from './radio-group';
import { SelectorStruct } from './selector';

/**
 * A subset of JSX elements that represent the tuple Box + Input of the Field children.
 */
const BOX_INPUT_LEFT = [
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  singleChild(lazy(() => BoxChildStruct)),
  InputStruct,
] as [typeof BoxChildStruct, typeof InputStruct];

/**
 * A subset of JSX elements that represent the tuple Input + Box of the Field children.
 */
const BOX_INPUT_RIGHT = [
  InputStruct,
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  singleChild(lazy(() => BoxChildStruct)),
] as [typeof InputStruct, typeof BoxChildStruct];

/**
 * A subset of JSX elements that represent the tuple Box + Input + Box of the Field children.
 */
const BOX_INPUT_BOTH = [
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  singleChild(lazy(() => BoxChildStruct)),
  InputStruct,
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  singleChild(lazy(() => BoxChildStruct)),
] as [typeof BoxChildStruct, typeof InputStruct, typeof BoxChildStruct];

/**
 * A subset of JSX elements that are allowed as single children of the Field component.
 */
const FIELD_CHILDREN_ARRAY = [
  InputStruct,
  DropdownStruct,
  RadioGroupStruct,
  FileInputStruct,
  CheckboxStruct,
  SelectorStruct,
] as [
  typeof InputStruct,
  typeof DropdownStruct,
  typeof RadioGroupStruct,
  typeof FileInputStruct,
  typeof CheckboxStruct,
  typeof SelectorStruct,
];

/**
 * A union of the allowed children of the Field component.
 * This is mainly used in the simulator for validation purposes.
 */
export const FieldChildUnionStruct = nullUnion([
  ...FIELD_CHILDREN_ARRAY,
  ...BOX_INPUT_LEFT,
  ...BOX_INPUT_RIGHT,
  ...BOX_INPUT_BOTH,
]);

/**
 * A subset of JSX elements that are allowed as children of the Field component.
 */
const FieldChildStruct = selectiveUnion((value) => {
  const isArray = Array.isArray(value);
  if (isArray && value.length === 3) {
    return tuple(BOX_INPUT_BOTH);
  }

  if (isArray && value.length === 2) {
    return value[0]?.type === 'Box'
      ? tuple(BOX_INPUT_LEFT)
      : tuple(BOX_INPUT_RIGHT);
  }

  return typedUnion(FIELD_CHILDREN_ARRAY);
}) as unknown as Struct<
  | [InputElement, GenericSnapChildren]
  | [GenericSnapChildren, InputElement]
  | [GenericSnapChildren, InputElement, GenericSnapChildren]
  | DropdownElement
  | RadioGroupElement
  | FileInputElement
  | InputElement
  | CheckboxElement
  | SelectorElement,
  null
>;

/**
 * A struct for the {@link FieldElement} type.
 */
export const FieldStruct: Describe<FieldElement> = element('Field', {
  label: optional(string()),
  error: optional(string()),
  children: FieldChildStruct,
});
