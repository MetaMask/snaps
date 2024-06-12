import type { File } from '@metamask/snaps-sdk';
import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Box, Text } from '@metamask/snaps-sdk/jsx';

import { Preview } from './Preview';

export type FileListProps = {
  files: File[];
};

export const FileList: SnapComponent<FileListProps> = ({ files }) => {
  if (files.length === 0) {
    return <Text>No files uploaded</Text>;
  }

  return (
    <Box>
      {files.map((file) => (
        <Preview file={file} key={file.name} />
      ))}
    </Box>
  );
};
