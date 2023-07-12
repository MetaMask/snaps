import { Box } from '@chakra-ui/react';
import type { FunctionComponent } from 'react';

import { useSelector } from '../../../hooks';
import { getManifestStatus, ManifestStatus } from '../../manifest/slice';

const MANIFEST_COLORS = {
  [ManifestStatus.Valid]: 'success.default',
  [ManifestStatus.Invalid]: 'error.default',
};

export const ManifestStatusIndicator: FunctionComponent = () => {
  const manifestStatus = useSelector(getManifestStatus);

  if (manifestStatus === ManifestStatus.Unknown) {
    return null;
  }

  return (
    <Box
      position="absolute"
      bottom="0"
      right="0"
      width="10px"
      height="10px"
      background={MANIFEST_COLORS[manifestStatus]}
      borderRadius="5px"
    />
  );
};
