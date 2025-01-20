import { createSnapComponent } from '../component';
import type { BorderRadius } from './utils';

/**
 * The props of the {@link Skeleton} component.
 *
 * @param width - Width of the Skeleton.
 * @param width - Height of the Skeleton.
 * @param borderRadius - Border radius of the Skeleton.
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
 */
export const Skeleton = createSnapComponent<SkeletonProps, typeof TYPE>(TYPE);

/**
 * A Skeleton element.
 *
 * @see Skeleton
 */
export type SkeletonElement = ReturnType<typeof Skeleton>;
