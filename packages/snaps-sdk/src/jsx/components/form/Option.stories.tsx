import type { Meta, Story } from '@metamask/snaps-storybook';

import { Dropdown } from './Dropdown';
import type { OptionProps } from './Option';
import { Option } from './Option';

const meta: Meta<typeof Option> = {
  title: 'Forms/Option',
  component: Option,
  argTypes: {
    value: {
      description:
        'The default value of the option field. This is used as the state value of the field.',
    },
    children: {
      description: 'The label of the option field.',
      control: 'text',
    },
  },
};

export default meta;

/**
 * The option component renders an option field within a dropdown. It cannot be
 * used outside of a dropdown.
 */
export const Default: Story<OptionProps> = {
  render: (props) => (
    <Dropdown name="dropdown-name">
      <Option {...props} />
    </Dropdown>
  ),
  args: {
    value: 'option-1',
    children: 'Option 1',
  },
};
