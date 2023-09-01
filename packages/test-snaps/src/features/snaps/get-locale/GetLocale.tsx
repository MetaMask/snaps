import { logError } from '@metamask/snaps-utils';
import type { FunctionComponent } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';

import { useInvokeMutation } from '../../../api';
import { Result, Snap } from '../../../components';
import { getSnapId } from '../../../utils';
import {
  GET_LOCALE_SNAP_ID,
  GET_LOCALE_SNAP_PORT,
  GET_LOCALE_VERSION,
} from './constants';

export const GetLocale: FunctionComponent = () => {
  const [invokeSnap, { isLoading, data }] = useInvokeMutation();
  const snapId = getSnapId(GET_LOCALE_SNAP_ID, GET_LOCALE_SNAP_PORT);

  const handleSubmit = () => {
    invokeSnap({
      snapId,
      method: 'hello',
    }).catch(logError);
  };

  return (
    <Snap
      name="Get Locale Snap"
      snapId={GET_LOCALE_SNAP_ID}
      port={GET_LOCALE_SNAP_PORT}
      version={GET_LOCALE_VERSION}
      testId="getlocale"
    >
      <ButtonGroup className="mb-3">
        <Button
          id="sendGetLocaleHelloButton"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          Submit
        </Button>
      </ButtonGroup>

      <Result>
        <span id="getLocaleResult">{JSON.stringify(data, null, 2)}</span>
      </Result>
    </Snap>
  );
};
