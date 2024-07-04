import type { OptionProps } from '@metamask/snaps-sdk/jsx';
import type { FunctionComponent } from 'react';

import type { RenderProps } from '../../Renderer';

/**
 * A dropdown option element.
 *
 * @param props - The props of the component.
 * @param props.value - The value of the dropdown option. This is used to
 * populate the state in the form data.
 * @param props.children - The text to display.
 * @returns A dropdown option element.
 * @see OptionProps
 */
export const Option: FunctionComponent<RenderProps<OptionProps>> = ({
  value,
  children,
}) => <option value={value}>{children}</option>;
