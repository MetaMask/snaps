import { logError } from '@metamask/snaps-utils';
import type { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { useInvokeMutation } from '../../../../api';
import { getSnapId } from '../../../../utils';
import { IMAGES_SNAP_ID, IMAGES_SNAP_PORT } from '../constants';

export type ShowImageProps = {
  method: string;
  name: string;
};

export const ShowImage: FunctionComponent<ShowImageProps> = ({
  method,
  name,
}) => {
  const [invokeSnap, { isLoading }] = useInvokeMutation();

  const handleShowImage = () => {
    invokeSnap({
      snapId: getSnapId(IMAGES_SNAP_ID, IMAGES_SNAP_PORT),
      method,
    }).catch(logError);
  };

  return (
    <Button
      id={`show${name}Image`}
      onClick={handleShowImage}
      disabled={isLoading}
    >
      Show {name}
    </Button>
  );
};
