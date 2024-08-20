import type { SnapsChildren } from '../../component';
import { createSnapComponent } from '../../component';
import type { OptionElement } from './Option';

/**
 * The props of the {@link Selector} component.
 *
 * @property name - The name of the dropdown. This is used to identify the
 * state in the form data.
 * @property value - The selected value of the dropdown.
 * @property children - The children of the dropdown.
 */
export type SelectorProps = {
  name: string;
  value?: string | undefined;
  children: SnapsChildren<OptionElement>;
};

const TYPE = 'Selector';

/**
 * A selector component, which is used to create a selector.
 *
 * @param props - The props of the component.
 * @param props.name - The name of the selector field. This is used to identify the
 * state in the form data.
 * @param props.value - The selected value of the selector.
 * @param props.children - The children of the selector.
 * @returns A selector element.
 * @example
 * <Selector name="selector">
 *  <Option value="option1">Option 1</Option>
 *  <Option value="option2">Option 2</Option>
 *  <Option value="option3">Option 3</Option>
 * </Selector>
 */
export const Selector = createSnapComponent<SelectorProps, typeof TYPE>(TYPE);

/**
 * A selector element.
 *
 * @see Selector
 */
export type SelectorElement = ReturnType<typeof Selector>;
