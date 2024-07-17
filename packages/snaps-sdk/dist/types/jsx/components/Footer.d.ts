import type { ButtonElement } from './form';
/**
 * The props of the {@link Footer} component.
 *
 * @property children - The single or multiple buttons in the footer.
 */
export declare type FooterProps = {
    children: ButtonElement | [ButtonElement, ButtonElement];
};
/**
 * A footer component, which is used to create a footer with buttons.
 *
 * @param props - The props of the component.
 * @param props.children - The single or multiple buttons in the footer.
 * @returns A footer element.
 * @example
 * <Footer>
 *   <Button name="cancel">Cancel</Button>
 *   <Button name="confirm">Confirm</Button>
 * </Footer>
 */
export declare const Footer: import("../component").SnapComponent<FooterProps, "Footer">;
/**
 * A footer element.
 *
 * @see Footer
 */
export declare type FooterElement = ReturnType<typeof Footer>;
