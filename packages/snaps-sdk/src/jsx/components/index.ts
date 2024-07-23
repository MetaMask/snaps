import type { AddressElement } from './Address';
import type { BoxElement } from './Box';
import type { CardElement } from './Card';
import type { ContainerElement } from './Container';
import type { CopyableElement } from './Copyable';
import type { DividerElement } from './Divider';
import type { FooterElement } from './Footer';
import type { StandardFormElement } from './form';
import type { StandardFormattingElement } from './formatting';
import type { HeadingElement } from './Heading';
import type { ImageElement } from './Image';
import type { LinkElement } from './Link';
import type { RowElement } from './Row';
import type { SpinnerElement } from './Spinner';
import type { TextElement } from './Text';
import type { TooltipElement } from './Tooltip';
import type { ValueElement } from './Value';

export * from './form';
export * from './formatting';
export * from './Address';
export * from './Box';
export * from './Card';
export * from './Copyable';
export * from './Divider';
export * from './Value';
export * from './Heading';
export * from './Image';
export * from './Link';
export * from './Row';
export * from './Spinner';
export * from './Text';
export * from './Tooltip';
export * from './Footer';
export * from './Container';

/**
 * A built-in JSX element, which can be used in a Snap user interface.
 */
export type JSXElement =
  | StandardFormElement
  | StandardFormattingElement
  | AddressElement
  | BoxElement
  | CardElement
  | ContainerElement
  | CopyableElement
  | DividerElement
  | FooterElement
  | ValueElement
  | HeadingElement
  | ImageElement
  | LinkElement
  | RowElement
  | SpinnerElement
  | TextElement
  | TooltipElement;
