import type { File } from '@metamask/snaps-sdk';
import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Button, Text, Box, Heading } from '@metamask/snaps-sdk/jsx';

import { FileList } from './FileList';

export type UploadedFilesProps = {
  file: File | null;
};

export const UploadedFiles: SnapComponent<UploadedFilesProps> = ({ file }) => {
  if (!file) {
    return (
      <Box>
        <Heading>File</Heading>
        <Text>No file uploaded.</Text>
        <Button name="back">Go back</Button>
      </Box>
    );
  }

  return (
    <Box>
      <Heading>File</Heading>
      <Text>The last file you uploaded was:</Text>
      <FileList files={[file]} />
    </Box>
  );
};
