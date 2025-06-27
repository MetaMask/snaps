import { Text } from 'ink';
import Link from 'ink-link';
import type { FunctionComponent, ReactNode } from 'react';
import { useState, useEffect } from 'react';

import { FullscreenBox } from './FullscreenBox.js';
import { GITHUB_ISSUES_URL } from '../constants.js';
import { write } from '../utils.js';

const ENTER_FULLSCREEN_MAGIC = '\x1b[?1049h';
const EXIT_FULLSCREEN_MAGIC = '\x1b[?1049l';

/**
 * Props for the {@link Fullscreen} component.
 */
export type FullscreenProps = {
  /**
   * The children to render inside the fullscreen box.
   */
  children: ReactNode;
};

/**
 * A component that enables fullscreen mode in the terminal. It writes
 * ANSI escape codes to the terminal to enter fullscreen mode when mounted,
 * and writes the exit code when unmounted.
 *
 * @param props - The props for the component.
 * @param props.children - The children to render inside the fullscreen box.
 * @returns The rendered component, which will be a fullscreen box containing
 * the children.
 */
export const Fullscreen: FunctionComponent<FullscreenProps> = ({
  children,
}): ReactNode => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    write(ENTER_FULLSCREEN_MAGIC)
      .then(() => setLoading(false))
      .catch((writeError) => {
        setError(writeError);
        setLoading(false);
      });

    return () => {
      write(EXIT_FULLSCREEN_MAGIC).catch((cleanupError) => {
        console.error('Failed to exit fullscreen mode:', cleanupError);
      });
    };
  }, []);

  if (loading) {
    return null;
  }

  if (error) {
    return (
      <Text>
        Failed to enter fullscreen mode. This is a bug, please report it on
        <Link url={GITHUB_ISSUES_URL}>GitHub</Link>.
      </Text>
    );
  }

  return <FullscreenBox>{children}</FullscreenBox>;
};
