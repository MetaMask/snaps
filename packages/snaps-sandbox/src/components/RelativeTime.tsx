import type { TextProps } from '@chakra-ui/react';
import { Text } from '@chakra-ui/react';
import type { FunctionComponent } from 'react';
import { useEffect, useState } from 'react';

import { getRelativeTime } from '../utils';

/**
 * The props for the {@link RelativeTime} component.
 */
export type RelativeTimeProps = TextProps & {
  /**
   * The time to display.
   */
  time: Date;
};

/**
 * A component that displays a relative time string.
 *
 * @param props - The component props.
 * @param props.time - The time to display.
 * @returns The relative time component.
 */
export const RelativeTime: FunctionComponent<RelativeTimeProps> = ({
  time,
  ...props
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return <Text {...props}>{getRelativeTime(time, currentTime)}</Text>;
};
