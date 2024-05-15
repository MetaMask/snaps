import type { Describe } from '../internals';
import type { GenericSnapElement, Key, StringElement } from './component';
import type { AddressElement, BoldElement, BoxElement, ButtonElement, CopyableElement, DividerElement, FieldElement, FormElement, HeadingElement, ImageElement, InputElement, ItalicElement, JSXElement, LinkElement, RowElement, SpinnerElement, StandardFormattingElement, TextElement } from './components';
/**
 * A struct for the {@link Key} type.
 */
export declare const KeyStruct: Describe<Key>;
/**
 * A struct for the {@link StringElement} type.
 */
export declare const StringElementStruct: Describe<StringElement>;
/**
 * A struct for the {@link GenericSnapElement} type.
 */
export declare const ElementStruct: Describe<GenericSnapElement>;
/**
 * A struct for the {@link ButtonElement} type.
 */
export declare const ButtonStruct: Describe<ButtonElement>;
/**
 * A struct for the {@link InputElement} type.
 */
export declare const InputStruct: Describe<InputElement>;
/**
 * A struct for the {@link FieldElement} type.
 */
export declare const FieldStruct: Describe<FieldElement>;
/**
 * A struct for the {@link FormElement} type.
 */
export declare const FormStruct: Describe<FormElement>;
/**
 * A struct for the {@link BoldElement} type.
 */
export declare const BoldStruct: Describe<BoldElement>;
/**
 * A struct for the {@link ItalicElement} type.
 */
export declare const ItalicStruct: Describe<ItalicElement>;
export declare const FormattingStruct: Describe<StandardFormattingElement>;
/**
 * A struct for the {@link AddressElement} type.
 */
export declare const AddressStruct: Describe<AddressElement>;
/**
 * A struct for the {@link BoxElement} type.
 */
export declare const BoxStruct: Describe<BoxElement>;
/**
 * A struct for the {@link CopyableElement} type.
 */
export declare const CopyableStruct: Describe<CopyableElement>;
/**
 * A struct for the {@link DividerElement} type.
 */
export declare const DividerStruct: Describe<DividerElement>;
/**
 * A struct for the {@link HeadingElement} type.
 */
export declare const HeadingStruct: Describe<HeadingElement>;
/**
 * A struct for the {@link ImageElement} type.
 */
export declare const ImageStruct: Describe<ImageElement>;
/**
 * A struct for the {@link LinkElement} type.
 */
export declare const LinkStruct: Describe<LinkElement>;
/**
 * A struct for the {@link TextElement} type.
 */
export declare const TextStruct: Describe<TextElement>;
/**
 * A struct for the {@link RowElement} type.
 */
export declare const RowStruct: Describe<RowElement>;
/**
 * A struct for the {@link SpinnerElement} type.
 */
export declare const SpinnerStruct: Describe<SpinnerElement>;
/**
 * A struct for the {@link JSXElement} type.
 */
export declare const JSXElementStruct: Describe<JSXElement>;
/**
 * Check if a value is a JSX element.
 *
 * @param value - The value to check.
 * @returns True if the value is a JSX element, false otherwise.
 */
export declare function isJSXElement(value: unknown): value is JSXElement;
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
export declare function isJSXElementUnsafe(value: unknown): value is JSXElement;
/**
 * Assert that a value is a JSX element.
 *
 * @param value - The value to check.
 * @throws If the value is not a JSX element.
 */
export declare function assertJSXElement(value: unknown): asserts value is JSXElement;
