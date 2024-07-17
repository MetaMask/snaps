import type { Struct } from '@metamask/superstruct';
import type { Describe } from '../internals';
import type { GenericSnapElement, Key, SnapElement, SnapsChildren, StringElement } from './component';
import type { AddressElement, BoldElement, BoxElement, ButtonElement, CheckboxElement, CardElement, CopyableElement, DividerElement, DropdownElement, OptionElement, FieldElement, FormElement, HeadingElement, ImageElement, InputElement, ItalicElement, JSXElement, LinkElement, RowElement, SpinnerElement, StandardFormattingElement, TextElement, TooltipElement, ValueElement, FileInputElement, ContainerElement, FooterElement } from './components';
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
 * A struct for the {@link CheckboxElement} type.
 */
export declare const CheckboxStruct: Describe<CheckboxElement>;
/**
 * A struct for the {@link InputElement} type.
 */
export declare const InputStruct: Describe<InputElement>;
/**
 * A struct for the {@link OptionElement} type.
 */
export declare const OptionStruct: Describe<OptionElement>;
/**
 * A struct for the {@link DropdownElement} type.
 */
export declare const DropdownStruct: Describe<DropdownElement>;
/**
 * A struct for the {@link FileInputElement} type.
 */
export declare const FileInputStruct: Describe<FileInputElement>;
/**
 * A union of the allowed children of the Field component.
 * This is mainly used in the simulator for validation purposes.
 */
export declare const FieldChildUnionStruct: Struct<SnapElement<import("./components").ButtonProps, "Button"> | SnapElement<import("./components").CheckboxProps, "Checkbox"> | SnapElement<import("./components").InputProps, "Input"> | SnapElement<import("./components").DropdownProps, "Dropdown"> | SnapElement<import("./components").FileInputProps, "FileInput">, null>;
/**
 * A struct for the {@link FieldElement} type.
 */
export declare const FieldStruct: Describe<FieldElement>;
/**
 * A subset of JSX elements that are allowed as children of the Form component.
 */
export declare const FormChildStruct: Struct<SnapsChildren<GenericSnapElement>, null>;
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
export declare const BoxChildrenStruct: Struct<SnapsChildren<GenericSnapElement>, null>;
/**
 * A struct for the {@link BoxElement} type.
 */
export declare const BoxStruct: Describe<BoxElement>;
/**
 * A subset of JSX elements that are allowed as children of the Footer component.
 * This set should include a single button or a tuple of two buttons.
 */
export declare const FooterChildStruct: Struct<SnapElement<import("./components").ButtonProps, "Button"> | [SnapElement<import("./components").ButtonProps, "Button">, SnapElement<import("./components").ButtonProps, "Button">], null>;
/**
 * A struct for the {@link FooterElement} type.
 */
export declare const FooterStruct: Describe<FooterElement>;
/**
 * A subset of JSX elements that are allowed as children of the Container component.
 * This set should include a single Box or a tuple of a Box and a Footer component.
 */
export declare const ContainerChildStruct: Struct<SnapElement<import("./components").BoxProps, "Box"> | [SnapElement<import("./components").BoxProps, "Box">, SnapElement<import("./components").FooterProps, "Footer">], null>;
/**
 * A struct for the {@link ContainerElement} type.
 */
export declare const ContainerStruct: Describe<ContainerElement>;
/**
 * A struct for the {@link CopyableElement} type.
 */
export declare const CopyableStruct: Describe<CopyableElement>;
/**
 * A struct for the {@link DividerElement} type.
 */
export declare const DividerStruct: Describe<DividerElement>;
/**
 * A struct for the {@link ValueElement} type.
 */
export declare const ValueStruct: Describe<ValueElement>;
/**
 * A struct for the {@link CardElement} type.
 */
export declare const CardStruct: Describe<CardElement>;
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
 * A subset of JSX elements that are allowed as children of the Tooltip component.
 * This set should include all text components and the Image.
 */
export declare const TooltipChildStruct: Struct<boolean | SnapElement<import("./components").BoldProps, "Bold"> | SnapElement<import("./components").ItalicProps, "Italic"> | SnapElement<{
    src: string;
    alt?: string | undefined;
}, "Image"> | SnapElement<import("./components").LinkProps, "Link"> | SnapElement<import("./components").TextProps, "Text">, null>;
/**
 * A subset of JSX elements that are allowed as content of the Tooltip component.
 * This set should include all text components.
 */
export declare const TooltipContentStruct: Struct<string | SnapElement<import("./components").BoldProps, "Bold"> | SnapElement<import("./components").ItalicProps, "Italic"> | SnapElement<import("./components").LinkProps, "Link"> | SnapElement<import("./components").TextProps, "Text">, null>;
/**
 * A struct for the {@link TooltipElement} type.
 */
export declare const TooltipStruct: Describe<TooltipElement>;
/**
 * A struct for the {@link RowElement} type.
 */
export declare const RowStruct: Describe<RowElement>;
/**
 * A struct for the {@link SpinnerElement} type.
 */
export declare const SpinnerStruct: Describe<SpinnerElement>;
/**
 * A subset of JSX elements that are allowed as children of the Box component.
 * This set includes all components, except components that need to be nested in
 * another component (e.g., Field must be contained in a Form).
 */
export declare const BoxChildStruct: Struct<SnapElement<import("./components").ButtonProps, "Button"> | SnapElement<import("./components").CheckboxProps, "Checkbox"> | SnapElement<import("./components").FormProps, "Form"> | SnapElement<import("./components").InputProps, "Input"> | SnapElement<import("./components").DropdownProps, "Dropdown"> | SnapElement<import("./components").FileInputProps, "FileInput"> | SnapElement<import("./components").BoldProps, "Bold"> | SnapElement<import("./components").ItalicProps, "Italic"> | SnapElement<import("./components").AddressProps, "Address"> | SnapElement<import("./components").BoxProps, "Box"> | SnapElement<import("./components").CardProps, "Card"> | SnapElement<import("./components").CopyableProps, "Copyable"> | SnapElement<Record<string, never>, "Divider"> | SnapElement<{
    children: StringElement;
}, "Heading"> | SnapElement<{
    src: string;
    alt?: string | undefined;
}, "Image"> | SnapElement<import("./components").LinkProps, "Link"> | SnapElement<import("./components").TextProps, "Text"> | SnapElement<import("./components").RowProps, "Row"> | SnapElement<Record<string, never>, "Spinner"> | SnapElement<import("./components").TooltipProps, "Tooltip">, null>;
/**
 * For now, the allowed JSX elements at the root are the same as the allowed
 * children of the Box component.
 */
export declare const RootJSXElementStruct: Struct<SnapElement<import("./components").ButtonProps, "Button"> | SnapElement<import("./components").CheckboxProps, "Checkbox"> | SnapElement<import("./components").FormProps, "Form"> | SnapElement<import("./components").InputProps, "Input"> | SnapElement<import("./components").DropdownProps, "Dropdown"> | SnapElement<import("./components").FileInputProps, "FileInput"> | SnapElement<import("./components").BoldProps, "Bold"> | SnapElement<import("./components").ItalicProps, "Italic"> | SnapElement<import("./components").AddressProps, "Address"> | SnapElement<import("./components").BoxProps, "Box"> | SnapElement<import("./components").CardProps, "Card"> | SnapElement<import("./components").ContainerProps, "Container"> | SnapElement<import("./components").CopyableProps, "Copyable"> | SnapElement<Record<string, never>, "Divider"> | SnapElement<{
    children: StringElement;
}, "Heading"> | SnapElement<{
    src: string;
    alt?: string | undefined;
}, "Image"> | SnapElement<import("./components").LinkProps, "Link"> | SnapElement<import("./components").TextProps, "Text"> | SnapElement<import("./components").RowProps, "Row"> | SnapElement<Record<string, never>, "Spinner"> | SnapElement<import("./components").TooltipProps, "Tooltip">, null>;
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
