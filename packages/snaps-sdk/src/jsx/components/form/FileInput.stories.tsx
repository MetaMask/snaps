import type { Meta, Story } from '@metamask/snaps-storybook';

import { Field } from './Field';
import type { FileInputProps } from './FileInput';
import { FileInput } from './FileInput';

const meta: Meta<typeof FileInput> = {
  title: 'Forms/FileInput',
  component: FileInput,
  argTypes: {
    name: {
      description:
        'The name of the file input field. This is used to identify the state in the form data.',
      control: 'text',
      table: {
        type: {
          summary: 'string',
        },
      },
    },
  },
};

export default meta;

/**
 * The file input component renders a drop zone for users to upload files. It
 * can also be clicked to open a file picker dialog.
 *
 * It shows the file name when a file is selected.
 */
export const Default: Story<FileInputProps> = {
  render: (props) => <FileInput {...props} />,
  args: {
    name: 'file-input-name',
  },
};

/**
 * The file input component in compact mode renders a button with an icon for
 * users to upload files. It can also be clicked to open a file picker dialog.
 */
export const Compact: Story<FileInputProps> = {
  render: (props) => <FileInput {...props} />,
  args: {
    name: 'file-input-name',
    compact: true,
  },
};

/**
 * The file input component with a label renders a label above the file input
 * field.
 */
export const WithinField: Story<FileInputProps> = {
  render: (props) => (
    <Field label="Upload file">
      <FileInput {...props} />
    </Field>
  ),
  args: {
    name: 'file-input-name',
  },
};

/**
 * The file input component can be configured to accept only files of a certain
 * type, like images.
 */
export const AcceptImages: Story<FileInputProps> = {
  render: (props) => <FileInput {...props} />,
  args: {
    name: 'file-input-name',
    accept: ['image/*'],
  },
};
