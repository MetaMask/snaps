import { logError } from '@metamask/snaps-utils';
import type { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';
import { useInvokeMutation } from 'src/api';
import { Result } from 'src/components';
import { getSnapId } from 'src/utils';

import { INTERACTIVE_UI_SNAP_ID, INTERACTIVE_UI_SNAP_PORT } from '../constants';

export type GetInterfaceStateProps = {
  interfaceId: string | undefined;
};

export const GetInterfaceState: FunctionComponent<GetInterfaceStateProps> = ({
  interfaceId,
}) => {
  const [invokeSnap, { isLoading, data, error }] = useInvokeMutation();

  const handleSubmit = () => {
    if (!interfaceId) {
      return;
    }

    invokeSnap({
      snapId: getSnapId(INTERACTIVE_UI_SNAP_ID, INTERACTIVE_UI_SNAP_PORT),
      method: 'get_state',
      params: {
        id: interfaceId,
      },
    }).catch(logError);
  };

  return (
    <>
      <Button
        variant="primary"
        id="getInterfaceStateButton"
        className="mb-3"
        disabled={isLoading}
        onClick={handleSubmit}
      >
        Get interface state
      </Button>
      <Result>
        <span id="getInterfaceStateResult">
          {JSON.stringify(data, null, 2)}
          {JSON.stringify(error, null, 2)}
        </span>
      </Result>
    </>
  );
};
