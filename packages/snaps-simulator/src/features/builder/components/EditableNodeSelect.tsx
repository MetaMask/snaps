import { Select } from '@chakra-ui/react';
import type { ChangeEvent, FunctionComponent } from 'react';
import { useState } from 'react';

type EditableNodeSelectProps = {
  defaultValue: string | undefined;
  options: string[];
  onChange: (value: string) => void;
};

/**
 * A dropdown for an editable node enum field, which renders a dropdown field in the editable component.
 *
 * @param props - The props of the component.
 * @param props.defaultValue - The property default value.
 * @param props.options - The options of the dropdown.
 * @param props.onChange - A function to call when the dropdown changes.
 * @returns An editable node dropdown component.
 */
export const EditableNodeSelect: FunctionComponent<EditableNodeSelectProps> = ({
  defaultValue,
  options,
  onChange,
}) => {
  const [value, setValue] = useState(defaultValue);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setValue(event.target.value);
    onChange(event.target.value);
  };

  return (
    <Select
      value={value}
      onChange={handleChange}
      fontSize="sm"
      bg="chakra-body-bg"
      borderColor="border.default"
      outline="none"
      _active={{
        borderColor: 'border.active',
        outline: 'none',
        boxShadow: 'none',
      }}
      _focusVisible={{
        borderColor: 'border.active',
        outline: 'none',
        boxShadow: 'none',
      }}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </Select>
  );
};
