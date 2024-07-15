import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';

/**
 * The overflow state.
 */
export type Overflow = {
  /**
   * The reference to the content container. This should be attached to the
   * content container with `overflow: hidden`.
   */
  contentRef: RefObject<HTMLDivElement>;

  /**
   * Whether the content is overflowing.
   */
  isOverflow: boolean;
};

/**
 * A hook to determine if the content is overflowing.
 *
 * Note: The `contentRef` should be attached to the content container with
 * `overflow: hidden`.
 *
 * @returns The overflow state.
 * @example
 * const { contentRef, isOverflow } = useOverflow();
 *
 * return (
 *   <Box ref={contentRef} overflow="hidden">
 *     ...
 *     {isOverflow && <More />}
 *   </Box>
 * );
 */
export const useOverflow = (): Overflow => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isOverflow, setOverflow] = useState(false);

  useEffect(() => {
    if (contentRef.current) {
      setOverflow(
        contentRef.current.offsetHeight < contentRef.current.scrollHeight,
      );
    }
  }, [contentRef]);

  return { contentRef, isOverflow };
};
