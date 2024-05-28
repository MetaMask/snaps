import { createSnapComponent } from '../component';

/**
 * The props of the {@link Value} component.
 *
 * @property value - The value shown on the right side.
 * @property extra - The extra text shown on the left side.
 */
export type ValueProps = {
  value: string;
  extra: string;
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
 */
export const Value = createSnapComponent<ValueProps, typeof TYPE>(TYPE);

/**
 * A value element.
 *
 * @see Value
 */
export type ValueElement = ReturnType<typeof Value>;
