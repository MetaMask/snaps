import type { BorderRadius } from './utils';
import { createSnapComponent } from '../component';

/**
 * The props of the {@link Skeleton} component.
 *
 * @param width - Width of the Skeleton.
 * @param width - Height of the Skeleton.
 * @param borderRadius - Border radius of the Skeleton.
 * @category Component Props
 */
export type SkeletonProps = {
  width?: number | string | undefined;
  height?: number | string | undefined;
  borderRadius?: BorderRadius | undefined;
};

const TYPE = 'Skeleton';

/**
 * A Skeleton component, which is used to display skeleton of loading content.
 *
 * @param props - The props of the component.
 * @param props.width - Width of the Skeleton.
 * @param props.width - Height of the Skeleton.
 * @param props.borderRadius - Border radius of the Skeleton.
 * @example
 * <Skeleton height={32} width="50%" />
 * @category Components
 */
export const Skeleton = createSnapComponent<SkeletonProps, typeof TYPE>(TYPE);

/**
 * A Skeleton element.
 *
 * @see {@link Skeleton}
 * @category Elements
 */
export type SkeletonElement = ReturnType<typeof Skeleton>;
