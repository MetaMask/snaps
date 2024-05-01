import type { AddressElement } from './Address';
import type { BoxElement } from './Box';
import type { CopyableElement } from './Copyable';
import type { DividerElement } from './Divider';
import type { StandardFormElement } from './form';
import type { StandardFormattingElement } from './formatting';
import type { HeadingElement } from './Heading';
import type { ImageElement } from './Image';
import type { LinkElement } from './Link';
import type { RowElement } from './Row';
import type { SpinnerElement } from './Spinner';
import type { TextElement } from './Text';

export * from './form';
export * from './formatting';
export * from './Address';
export * from './Box';
export * from './Copyable';
export * from './Divider';
export * from './Heading';
export * from './Image';
export * from './Link';
export * from './Row';
export * from './Spinner';
export * from './Text';

/**
 * A built-in JSX element, which can be used in a Snap user interface.
 */
export type JSXElement =
  | StandardFormElement
  | StandardFormattingElement
  | AddressElement
  | BoxElement
  | CopyableElement
  | DividerElement
  | HeadingElement
  | ImageElement
  | LinkElement
  | RowElement
  | SpinnerElement
  | TextElement;
