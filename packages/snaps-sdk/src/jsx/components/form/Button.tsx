import type { StringElement } from '../../component';
import { createSnapComponent } from '../../component';

/**
 * The props of the {@link Button} component.
 *
 * @property children - The text to display on the button. This should be a
 * string or an array of strings.
 * @property onClick - The function to call when the button is clicked.
 */
export type ButtonProps = {
  children: StringElement;
  onClick?: (() => void) | undefined;
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
 * function handleClick() {
 *   // Do something
 * }
 *
 * <Button onClick={handleClick}>Click me</Button>
 */
export const Button = createSnapComponent<ButtonProps, typeof TYPE>(TYPE);

/**
 * A button element.
 *
 * @see Button
 */
export type ButtonElement = ReturnType<typeof Button>;
