import type { ButtonElement } from './form/Button';
import type { StandardFormattingElement } from './formatting';
import type { IconElement } from './Icon';
import type { LinkElement } from './Link';
import type { SkeletonElement } from './Skeleton';
import type { TextElement } from './Text';
import { createSnapComponent, type SnapsChildren } from '../component';

/**
 * Types of children components that can be used with Banner.
 */
export type BannerChildren = SnapsChildren<
  | TextElement
  | StandardFormattingElement
  | LinkElement
  | IconElement
  | ButtonElement
  | SkeletonElement
>;

/**
 * The props of the {@link Banner} component.
 *
 * @param children - The content to display in the banner.
 * @param title - Title of the banner.
 * @param severity - Severity level of the banner.
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
 * @param props.children - The content to display in the banner.
 * @param props.title - Title of the banner.
 * @param props.severity - Severity level of the banner.
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
