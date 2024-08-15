import { createSnapComponent } from '../component';

/**
 * The props of the {@link Icon} component.
 *
 * @property name - The name of the icon to display from a pre-defined list.
 * @property color - The color of the displayed icon.
 * @property size - The size of the displayed icon. Use `inherit` to size it the same as the text.
 */
export type IconProps = {
  name: string;
  color?:
    | 'default'
    | 'primary'
    | 'error'
    | 'success'
    | 'warning'
    | 'info'
    | undefined;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'inherit' | undefined;
};

const TYPE = 'Icon';

/**
 * An icon component which is used to display an icon from a pre-defined list.
 *
 * @param props - The props of the component.
 * @param props.name - The name of the icon to display from a pre-defined list.
 * @param props.color - The color of the displayed icon.
 * @param props.size - The size of the displayed icon. Use `inherit` to size it the same as the text.
 * @returns An icon element.
 * @example
 * <Icon name="warning" color="warning" size="lg" />
 */
export const Icon = createSnapComponent<IconProps, typeof TYPE>(TYPE);

/**
 * An icon element.
 *
 * @see Icon
 */
export type IconElement = ReturnType<typeof Icon>;
