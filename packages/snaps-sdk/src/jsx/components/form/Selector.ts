import type { SnapsChildren } from '../../component';
import { createSnapComponent } from '../../component';
import type { CardElement } from '../Card';

/**
 * The props of the {@link Selector.Option} component.
 *
 * @property value - The value of the selector option. This is used to populate the
 * state in the form data.
 * @property children - The component to display.
 */
export type SelectorOptionProps = {
  value: string;
  children: CardElement;
};

const OPTION_TYPE = 'SelectorOption';

const SelectorOption = createSnapComponent<
  SelectorOptionProps,
  typeof OPTION_TYPE
>(OPTION_TYPE);

/**
 * The props of the {@link Selector} component.
 *
 * @property name - The name of the selector. This is used to identify the
 * state in the form data.
 * @property title - The title of the selector. This is displayed in the UI.
 * @property value - The selected value of the selector.
 * @property children - The children of the selector.
 */
export type SelectorProps = {
  name: string;
  title: string;
  value?: string | undefined;
  children: SnapsChildren<SelectorOptionElement>;
};

const TYPE = 'Selector';

const SelectorComponent = createSnapComponent<SelectorProps, typeof TYPE>(TYPE);

/**
 * A selector component, which is used to create a selector.
 *
 * @param props - The props of the component.
 * @param props.name - The name of the selector field. This is used to identify the
 * state in the form data.
 * @param props.title - The title of the selector field. This is displayed in the UI.
 * @param props.value - The selected value of the selector.
 * @param props.children - The children of the selector.
 * @returns A selector element.
 * @example
 * <Selector name="selector">
 *  <Selector.Option value="option1"><Card title="Option 1" value="Foo" /></Selector.Option>
 *  <Selector.Option value="option2"><Card title="Option 2" value="Bar" /></Selector.Option>
 *  <Selector.Option value="option3"><Card title="Option 3" value="Baz" /></Selector.Option>
 * </Selector>
 */
export const Selector: typeof SelectorComponent & {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Option: typeof SelectorOption;
} = SelectorComponent as unknown as typeof SelectorComponent & {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Option: typeof SelectorOption;
};

Selector.Option = SelectorOption;

/**
 * A selector element.
 *
 * @see Selector
 */
export type SelectorElement = ReturnType<typeof SelectorComponent>;

/**
 * A selector option element.
 *
 * @see Selector.Option
 */
export type SelectorOptionElement = ReturnType<typeof SelectorOption>;
