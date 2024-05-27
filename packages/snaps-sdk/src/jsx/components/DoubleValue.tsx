import { createSnapComponent } from '../component';

/**
 * The props of the {@link DoubleValue} component.
 *
 * @property address - The (Ethereum) address to display. This should be a
 * valid Ethereum address, starting with `0x`.
 */
export type DoubleValueProps = {
  left: string;
  right: string;
};

const TYPE = 'DoubleValue';

/**
 * An double value component, which can be used to display two different text values in a row.
 *
 * This component does not accept any children.
 *
 * @param props - The props of the component.
 * @param props.left - The text to show on the left side.
 * @param props.right - The text to show on the right side.
 * @returns A double value element.
 * @example
 * <DoubleValue left="$200" right="0.05 ETH" />
 */
export const DoubleValue = createSnapComponent<DoubleValueProps, typeof TYPE>(
  TYPE,
);

/**
 * A double value element.
 *
 * @see DoubleValue
 */
export type DoubleValueElement = ReturnType<typeof DoubleValue>;
