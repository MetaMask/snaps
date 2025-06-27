import { useStdout } from 'ink';
import { useCallback, useEffect, useState } from 'react';

/**
 * Hook to get the current terminal size, which updates on resize events.
 *
 * @returns An object containing the current terminal width and height.
 */
export function useTerminalSize() {
  const { stdout } = useStdout();
  const getSize = useCallback(
    () => ({ width: stdout.columns, height: stdout.rows - 1 }),
    [stdout],
  );

  const [size, setSize] = useState(getSize);

  useEffect(() => {
    /**
     * Handle `stdout` resize event.
     */
    const onResize = () => {
      setSize(getSize());
    };

    stdout.on('resize', onResize);

    return () => {
      stdout.off('resize', onResize);
    };
  }, [stdout, getSize]);

  return size;
}
