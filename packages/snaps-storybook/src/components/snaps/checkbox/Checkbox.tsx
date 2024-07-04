import { Checkbox as ChakraCheckbox, Switch } from '@chakra-ui/react';
import type { CheckboxProps } from '@metamask/snaps-sdk/jsx';
import type { FunctionComponent } from 'react';

import { CheckBoldIcon } from '../../icons';
import type { RenderProps } from '../../Renderer';

/**
 * A checkbox element, which renders a checkbox input field.
 *
 * @param props - The props of the component.
 * @param props.name - The name of the checkbox input field. This is used to
 * populate the state in the form data.
 * @param props.checked - Whether the checkbox is checked or not.
 * @param props.label - The label of the checkbox.
 * @param props.variant - The variant of the checkbox.
 * @returns A checkbox element.
 */
export const Checkbox: FunctionComponent<RenderProps<CheckboxProps>> = ({
  name,
  checked,
  label,
  variant,
}) => {
  if (variant === 'toggle') {
    return (
      <Switch name={name} defaultChecked={checked}>
        {label}
      </Switch>
    );
  }

  return (
    <ChakraCheckbox
      name={name}
      defaultChecked={checked}
      icon={<CheckBoldIcon />}
      iconSize="20px"
    >
      {label}
    </ChakraCheckbox>
  );
};
