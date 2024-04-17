import type { StringElement } from '../../component';
import { createSnapComponent } from '../../component';

// TODO: Add the `onClick` prop to the `ButtonProps` type.

/**
 * The props of the {@link Button} component.
 *
 * @property children - The text to display on the button.
 * @property name - The name of the button. This is used to identify the button
 * in the event handler.
 * @property type - The type of the button, i.e., `'button'` or `'submit'`.
 * Defaults to `'button'`.
 */
export type ButtonProps = {
  children: StringElement;
  name?: string | undefined;
  type?: 'button' | 'submit' | undefined;
};

const TYPE = 'button';

/**
 * A button component, which is used to create a clickable button.
 *
 * @param props - The props of the component.
 * @param props.children - The text to display on the button. This should be a
 * string or an array of strings.
 * @param props.onClick - The function to call when the button is clicked.
 * @returns A button element.
 * @example
 * <Button onClick={handleClick}>Click me</Button>
 */
export const Button = createSnapComponent<ButtonProps, typeof TYPE>(TYPE);

/**
 * A button element.
 *
 * @see Button
 */
export type ButtonElement = ReturnType<typeof Button>;