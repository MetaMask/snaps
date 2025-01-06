import { logError } from '@metamask/snaps-utils';
import type { ChangeEvent, FormEvent, FunctionComponent } from 'react';
import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';

import { useInvokeMutation } from '../../../../api';
import { Result } from '../../../../components';
import { getSnapId } from '../../../../utils';
import {
  ETHEREUM_PROVIDER_SNAP_ID,
  ETHEREUM_PROVIDER_SNAP_PORT,
} from '../constants';

export const SignTypedData: FunctionComponent = () => {
  const [message, setMessage] = useState('');
  const [invokeSnap, { isLoading, data, error }] = useInvokeMutation();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    invokeSnap({
      snapId: getSnapId(ETHEREUM_PROVIDER_SNAP_ID, ETHEREUM_PROVIDER_SNAP_PORT),
      method: 'signTypedData',
      params: {
        message,
      },
    }).catch(logError);
  };

  return (
    <>
      <h3 className="h5">Sign Typed Data</h3>
      <Form onSubmit={handleSubmit} className="mb-3">
        <Form.Label>Message</Form.Label>
        <Form.Control
          type="text"
          placeholder="Message"
          value={message}
          onChange={handleChange}
          id="signTypedData"
          className="mb-3"
        />

        <Button type="submit" id="signTypedDataButton" disabled={isLoading}>
          Sign Typed Data
        </Button>
      </Form>
      <Result>
        <span id="signTypedDataResult">
          {JSON.stringify(data, null, 2)}
          {JSON.stringify(error, null, 2)}
        </span>
      </Result>
    </>
  );
};
