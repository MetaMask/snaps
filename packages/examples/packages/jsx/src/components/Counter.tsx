import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Bold, Button, Box, Text, Tooltip } from '@metamask/snaps-sdk/jsx';

/**
 * The props for the {@link Counter} component.
 *
 * @property count - The current count.
 */
export type CounterProps = {
  count: number;
};

/**
 * A tooltip content component, which explains how to use the counter.
 * This component is used as the content of a {@link Tooltip} component.
 *
 * @returns The tooltip content component.
 */
export const TooltipContent = () => (
  <Text>
    Click the <Bold>increment</Bold> button to increase the count.
  </Text>
);

/**
 * A counter component, which shows the current count, and a button to increment
 * it by one.
 *
 * @param props - The component props.
 * @param props.count - The current count.
 * @returns The counter component.
 */
export const Counter: SnapComponent<CounterProps> = ({ count }) => {
  return (
    <Box>
      <Tooltip content={<TooltipContent />}>
        <Text>
          Count: <Bold>{String(count)}</Bold>
        </Text>
      </Tooltip>
      <Button name="increment">Increment</Button>
    </Box>
  );
};
