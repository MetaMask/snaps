import type { File } from '@metamask/snaps-sdk';
import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Form, FileInput, Box, Field, Heading } from '@metamask/snaps-sdk/jsx';

import { FileList } from './FileList';

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
      </Form>
      <FileList files={files} />
    </Box>
  );
};
