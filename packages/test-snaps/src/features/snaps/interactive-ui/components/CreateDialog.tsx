import { logError } from '@metamask/snaps-utils';
import { useEffect, type FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';
import { useInvokeMutation } from 'src/api';
import { Result } from 'src/components';
import { getSnapId } from 'src/utils';

import { INTERACTIVE_UI_SNAP_ID, INTERACTIVE_UI_SNAP_PORT } from '../constants';

export type CreateDialogProps = {
  setInterfaceId: (id: string) => void;
};

export const CreateDialog: FunctionComponent<CreateDialogProps> = ({
  setInterfaceId,
}) => {
  const [invokeSnap, { isLoading, data, error }] = useInvokeMutation();

  useEffect(() => {
    setInterfaceId(data as string);
  }, [data]);

  const handleSubmit = () => {
    invokeSnap({
      snapId: getSnapId(INTERACTIVE_UI_SNAP_ID, INTERACTIVE_UI_SNAP_PORT),
      method: 'dialog',
    }).catch(logError);
  };

  return (
    <>
      <Button
        variant="primary"
        id="createDialogButton"
        className="mb-3"
        disabled={isLoading}
        onClick={handleSubmit}
      >
        Create Dialog
      </Button>
      <Result className="mb-3">
        <span id="createDialogResult">
          {JSON.stringify(data, null, 2)}
          {JSON.stringify(error, null, 2)}
        </span>
      </Result>
    </>
  );
};
