import { ChangeEvent, FunctionComponent } from 'react';
import { Button, Form } from 'react-bootstrap';

import { useInvokeMutation } from '../../api';
import { Result, Snap } from '../../components';
import { getSnapId } from '../../utils/id';

const DIALOG_SNAP_ID = 'npm:@metamask/test-snap-dialog';
const DIALOG_SNAP_PORT = 8001;

export const Dialog: FunctionComponent = () => {
  const [invokeSnap, { isLoading, data }] = useInvokeMutation();

  const handleSubmitAlert = (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    invokeSnap({
      snapId: getSnapId(DIALOG_SNAP_ID, DIALOG_SNAP_PORT),
      method: 'dialogAlert',
    });
  };

  const handleSubmitConf = (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    invokeSnap({
      snapId: getSnapId(DIALOG_SNAP_ID, DIALOG_SNAP_PORT),
      method: 'dialogConf',
    });
  };

  const handleSubmitPrompt = (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    invokeSnap({
      snapId: getSnapId(DIALOG_SNAP_ID, DIALOG_SNAP_PORT),
      method: 'dialogPrompt',
    });
  };

  return (
    <Snap
      name="Dialog Snap"
      snapId={DIALOG_SNAP_ID}
      port={DIALOG_SNAP_PORT}
      testId="DialogSnap"
    >
      <Form className="mb-3">
        <Button
          id="sendAlertButton"
          onClick={handleSubmitAlert}
          disabled={isLoading}
        >
          Alert Dialog
        </Button>
        <Button
          id="sendConfButton"
          onClick={handleSubmitConf}
          disabled={isLoading}
        >
          Conf Dialog
        </Button>
        <Button
          id="sendPromptButton"
          onClick={handleSubmitPrompt}
          disabled={isLoading}
        >
          Prompt Dialog
        </Button>
      </Form>

      <Result>
        <span id="dialogResult">{JSON.stringify(data, null, 2)}</span>
      </Result>
    </Snap>
  );
};
