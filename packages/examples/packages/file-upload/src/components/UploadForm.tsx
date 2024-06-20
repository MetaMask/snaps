import type { File } from '@metamask/snaps-sdk';
import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import {
  Button,
  Form,
  FileInput,
  Box,
  Field,
  Heading,
} from '@metamask/snaps-sdk/jsx';

import { FileList } from './FileList';

/**
 * The state of the {@link UploadForm} component.
 */
export type UploadFormState = {
  /**
   * The file that was uploaded, or `null` if no file was uploaded.
   */
  file: File | null;
};

export type InteractiveFormProps = {
  files: File[];
};

export const UploadForm: SnapComponent<InteractiveFormProps> = ({ files }) => {
  return (
    <Box>
      <Heading>File Upload</Heading>
      <Form name="foo">
        <Field>
          <FileInput name="file" />
        </Field>
        <Button type="submit">Submit</Button>
      </Form>
      <FileList files={files} />
    </Box>
  );
};
