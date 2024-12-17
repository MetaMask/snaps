import { createSnapComponent, type SnapsChildren } from '../component';
import type { ButtonElement } from './form/Button';
import type { StandardFormattingElement } from './formatting';
import type { IconElement } from './Icon';
import type { LinkElement } from './Link';
import type { TextElement } from './Text';

/**
 * Types of children components that can be used with Banner.
 */
export type BannerChildren = SnapsChildren<
  | TextElement
  | StandardFormattingElement
  | LinkElement
  | IconElement
  | ButtonElement
>;

/**
 * The props of the {@link Banner} component.
 */
export type BannerProps = {
  children: BannerChildren;
  title: string;
  severity: 'danger' | 'info' | 'success' | 'warning';
};

const TYPE = 'Banner';

/**
 * A Banner component, which is used to display custom banner alerts.
 *
 * @param props - The props of the component.
 * @example
 * <Banner title="Success banner" severity="success">
 *   <Text>Here is the banner content!</Text>
 * </Banner>
 */
export const Banner = createSnapComponent<BannerProps, typeof TYPE>(TYPE);

/**
 * A Banner element.
 *
 * @see Banner
 */
export type BannerElement = ReturnType<typeof Banner>;
