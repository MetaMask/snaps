import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { useInvokeMutation } from '../../api';
import { Result, Snap } from '../../components';
import { getSnapId } from '../../utils/id';

const ERROR_SNAP_ID = 'npm:@metamask/test-snap-error';
const ERROR_SNAP_PORT = 8002;

export const ErrorSnap: FunctionComponent = () => {
  const [invokeSnap, { isLoading, data, error }] = useInvokeMutation();

  const handleSubmit = () => {
    invokeSnap({
      snapId: getSnapId(ERROR_SNAP_ID, ERROR_SNAP_PORT),
      method: 'test',
    });
  };

  return (
    <Snap
      name="Error Snap"
      snapId={ERROR_SNAP_ID}
      port={ERROR_SNAP_PORT}
      testId="ErrorSnap"
    >
      <Button
        variant="primary"
        id="sendError"
        className="mb-3"
        disabled={isLoading}
        onClick={handleSubmit}
      >
        Send Test to Error Snap
      </Button>
      <Result>
        <span id="errorResult">
          {JSON.stringify(data, null, 2)}
          {JSON.stringify(error, null, 2)}
        </span>
      </Result>
    </Snap>
  );
};
