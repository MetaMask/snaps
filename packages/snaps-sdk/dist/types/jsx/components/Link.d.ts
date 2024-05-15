import type { MaybeArray } from '../component';
import type { StandardFormattingElement } from './formatting';
/**
 * The children of the {@link Link} component.
 */
export declare type LinkChildren = MaybeArray<string | StandardFormattingElement | null>;
/**
 * The props of the {@link Link} component.
 *
 * @property children - The text to display in the link.
 * @property href - The URL to link to. This must be an `https` or `mailto` URL.
 * `http` is not allowed.
 */
export declare type LinkProps = {
    children: LinkChildren;
    href: string;
};
/**
 * A link component, which is used to display a hyperlink.
 *
 * @param props - The props of the component.
 * @param props.children - The text to display in the link.
 * @param props.href - The URL to link to. This must be an `https` or `mailto`
 * URL. `http` is not allowed.
 * @returns A link element.
 * @example
 * <Link href="https://example.com">Click here</Link>
 */
export declare const Link: import("../component").SnapComponent<LinkProps, "Link">;
/**
 * A link element.
 *
 * @see Link
 */
export declare type LinkElement = ReturnType<typeof Link>;
