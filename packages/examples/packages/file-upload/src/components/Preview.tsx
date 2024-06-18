import type { File } from '@metamask/snaps-sdk';
import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Text, Box, Image } from '@metamask/snaps-sdk/jsx';
import { base64ToBytes, bytesToString } from '@metamask/utils';

export type PreviewProps = {
  file: File;
};

export const Preview: SnapComponent<PreviewProps> = ({ file }) => {
  return (
    <Box>
      <Text>{file.name}</Text>
      {file.contentType === 'image/svg+xml' ? (
        <Image src={bytesToString(base64ToBytes(file.contents))} />
      ) : null}
    </Box>
  );
};
