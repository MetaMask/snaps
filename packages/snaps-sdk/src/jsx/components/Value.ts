import type { TextElement } from './Text';
import { createSnapComponent } from '../component';

/**
 * The props of the {@link Value} component.
 *
 * @property value - The value shown on the right side.
 * @property extra - The extra text shown on the left side.
 * @category Component Props
 */
export type ValueProps = {
  value: TextElement | string;
  extra: TextElement | string;
};

const TYPE = 'Value';

/**
 * A value component, which can be used to display two different text values side by side.
 *
 * This component can only be used as a child of the {@link Row} component.
 *
 * This component does not accept any children.
 *
 * @param props - The props of the component.
 * @param props.value - The value shown on the right side.
 * @param props.extra - The extra text shown on the left side.
 * @returns A value element.
 * @example
 * <Value value="0.05 ETH" extra="$200" />
 * @example
 * <Value value={<Text color='error'>0.05 ETH</Text>} extra={<Text color='error'>$200</Text>} />
 * @category Components
 */
export const Value = createSnapComponent<ValueProps, typeof TYPE>(TYPE);

/**
 * A value element.
 *
 * @see {@link Value}
 * @category Elements
 */
export type ValueElement = ReturnType<typeof Value>;
