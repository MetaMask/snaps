import { is } from '@metamask/superstruct';
import { hasProperty, isPlainObject } from '@metamask/utils';

import type { Describe } from '../../internals';
import { typedUnion } from '../../internals';
import type { JSXElement } from '../components';
import { AddressStruct } from './address';
import { AvatarStruct } from './avatar';
import { BoxStruct } from './box';
import { CardStruct } from './card';
import { ContainerStruct } from './container';
import { CopyableStruct } from './copyable';
import { DividerStruct } from './divider';
import { FooterStruct } from './footer';
import {
  ButtonStruct,
  CheckboxStruct,
  DropdownStruct,
  FieldStruct,
  FileInputStruct,
  FormStruct,
  InputStruct,
  OptionStruct,
  RadioGroupStruct,
  RadioStruct,
  SelectorOptionStruct,
  SelectorStruct,
} from './form';
import { BoldStruct, ItalicStruct } from './formatting';
import { HeadingStruct } from './heading';
import { IconStruct } from './icon';
import { ImageStruct } from './image';
import { LinkStruct } from './link';
import { RowStruct } from './row';
import { SectionStruct } from './section';
import { SpinnerStruct } from './spinner';
import { TextStruct } from './text';
import { TooltipStruct } from './tooltip';
import { ValueStruct } from './value';

/**
 * A subset of JSX elements that are allowed as children of the Box component.
 * This set includes all components, except components that need to be nested in
 * another component (e.g., Field must be contained in a Form).
 */
export const BoxChildStruct = typedUnion([
  AddressStruct,
  BoldStruct,
  BoxStruct,
  ButtonStruct,
  CopyableStruct,
  DividerStruct,
  DropdownStruct,
  RadioGroupStruct,
  FieldStruct,
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
  CardStruct,
  IconStruct,
  SelectorStruct,
  SectionStruct,
  AvatarStruct,
]);

/**
 * A struct for the {@link JSXElement} type.
 */
export const JSXElementStruct: Describe<JSXElement> = typedUnion([
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
  RadioGroupStruct,
  RadioStruct,
  ValueStruct,
  TooltipStruct,
  CheckboxStruct,
  FooterStruct,
  ContainerStruct,
  CardStruct,
  IconStruct,
  SelectorStruct,
  SelectorOptionStruct,
  SectionStruct,
  AvatarStruct,
]);

/**
 * For now, the allowed JSX elements at the root are the same as the allowed
 * children of the Box component.
 */
export const RootJSXElementStruct = typedUnion([
  BoxChildStruct,
  ContainerStruct,
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
