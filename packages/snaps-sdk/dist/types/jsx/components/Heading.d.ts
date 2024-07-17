import type { StringElement } from '../component';
/**
 * The props of the {@link Heading} component.
 *
 * @property children - The text to display in the heading.
 */
declare type HeadingProps = {
    children: StringElement;
};
/**
 * A heading component, which is used to display heading text.
 *
 * @param props - The props of the component.
 * @param props.children - The text to display in the heading.
 * @returns A heading element.
 * @example
 * <Heading>Hello world!</Heading>
 */
export declare const Heading: import("../component").SnapComponent<HeadingProps, "Heading">;
/**
 * A heading element.
 *
 * @see Heading
 */
export declare type HeadingElement = ReturnType<typeof Heading>;
export {};
