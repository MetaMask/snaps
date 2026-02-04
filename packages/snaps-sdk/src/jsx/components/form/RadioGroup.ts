import type { RadioElement } from './Radio';
import type { SnapsChildren } from '../../component';
import { createSnapComponent } from '../../component';

const TYPE = 'RadioGroup';

/**
 * The props of the {@link RadioGroup} component.
 *
 * @property name - The name of the dropdown. This is used to identify the
 * state in the form data.
 * @property value - The value of the radio group element.
 * @property children - Radio options in form of <Radio> elements.
 * @property disabled - Whether the radio group is disabled.
 * @category Component Props
 */
type RadioGroupProps = {
  name: string;
  value?: string | undefined;
  children: SnapsChildren<RadioElement>;
  disabled?: boolean | undefined;
};

/**
 * A RadioGroup component, used to display multiple choices, where only one can be chosen.
 *
 * @param props.name - The name of the dropdown. This is used to identify the
 * state in the form data.
 * @param props.value - The value of the radio group element.
 * @param props.children - Radio options in form of <Radio> elements.
 * @param props.disabled - Whether the radio group is disabled.
 * @returns A RadioGroup element.
 * @example
 * <RadioGroup />
 * @category Components
 */
export const RadioGroup = createSnapComponent<RadioGroupProps, typeof TYPE>(
  TYPE,
);

/**
 * A RadioGroup element.
 *
 * @see {@link RadioGroup}
 * @category Elements
 */
export type RadioGroupElement = ReturnType<typeof RadioGroup>;
