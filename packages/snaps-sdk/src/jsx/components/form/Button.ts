import type { SnapsChildren, StringElement } from '../../component';
import { createSnapComponent } from '../../component';
import type { IconElement } from '../Icon';
import type { ImageElement } from '../Image';

// TODO: Add the `onClick` prop to the `ButtonProps` type.

/**
 * The props of the {@link Button} component.
 *
 * @property children - The text to display on the button.
 * @property name - The name of the button. This is used to identify the button
 * in the event handler.
 * @property type - The type of the button, i.e., `'button'` or `'submit'`.
 * Defaults to `'button'`.
 * @property variant - The variant of the button, i.e., `'primary'` or
 * `'destructive'`. Defaults to `'primary'`.
 * @property disabled - Whether the button is disabled. Defaults to `false`.
 * @property form - The name of the form component to associate the button with.
 */
export type ButtonProps = {
  children: SnapsChildren<StringElement | IconElement | ImageElement>;
  name?: string | undefined;
  type?: 'button' | 'submit' | undefined;
  variant?: 'primary' | 'destructive' | 'loading' | undefined;
  disabled?: boolean | undefined;
  form?: string | undefined;
};

const TYPE = 'Button';

/**
 * A button component, which is used to create a clickable button.
 *
 * @param props - The props of the component.
 * @param props.children - The text to display on the button. This should be a
 * string or an array of strings.
 * @returns A button element.
 * @example
 * <Button name="my-button">Click me</Button>
 */
export const Button = createSnapComponent<ButtonProps, typeof TYPE>(TYPE);

/**
 * A button element.
 *
 * @see Button
 */
export type ButtonElement = ReturnType<typeof Button>;
