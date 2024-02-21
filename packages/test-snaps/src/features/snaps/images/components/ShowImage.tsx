import { logError } from '@metamask/snaps-utils';
import type { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { useInvokeMutation } from '../../../../api';
import { getSnapId } from '../../../../utils';
import { IMAGES_SNAP_ID, IMAGES_SNAP_PORT } from '../constants';

export const ShowImage: FunctionComponent = () => {
  const [invokeSnap, { isLoading }] = useInvokeMutation();

  const handleShowImage = () => {
    invokeSnap({
      snapId: getSnapId(IMAGES_SNAP_ID, IMAGES_SNAP_PORT),
      method: 'getCat',
    }).catch(logError);
  };

  return (
    <Button id="showImage" onClick={handleShowImage} disabled={isLoading}>
      Show Image
    </Button>
  );
};
