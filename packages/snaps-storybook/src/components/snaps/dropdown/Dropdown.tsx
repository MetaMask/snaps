import { Select } from '@chakra-ui/react';
import type { DropdownProps } from '@metamask/snaps-sdk/jsx';
import type { FunctionComponent } from 'react';

import { ArrowDownIcon } from '../../icons';
import type { RenderProps } from '../../Renderer';

/**
 * A dropdown element, which renders a dropdown input field.
 *
 * @param props - The props of the component.
 * @param props.name - The name of the dropdown input field. This is used to
 * populate the state in the form data.
 * @param props.value - The selected value of the dropdown.
 * @param props.children - The dropdown options.
 * @param props.Renderer - The renderer component to render the children.
 * @returns A dropdown element.
 */
export const Dropdown: FunctionComponent<RenderProps<DropdownProps>> = ({
  name,
  value,
  children,
  Renderer,
}) => (
  <Select
    defaultValue={value}
    name={name}
    iconSize="16px"
    icon={<ArrowDownIcon />}
  >
    <Renderer id="dropdown" element={children} />
  </Select>
);
