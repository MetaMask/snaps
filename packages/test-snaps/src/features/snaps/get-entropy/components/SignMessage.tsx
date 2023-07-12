import { logError } from '@metamask/snaps-utils';
import type { ChangeEvent, FormEvent, FunctionComponent } from 'react';
import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';

import { useInvokeMutation } from '../../../../api';
import { Result } from '../../../../components';
import { getSnapId } from '../../../../utils';
import { GET_ENTROPY_SNAP_ID, GET_ENTROPY_PORT } from '../constants';

export const SignMessage: FunctionComponent = () => {
  const [message, setMessage] = useState('');
  const [invokeSnap, { isLoading, data, error }] = useInvokeMutation();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    invokeSnap({
      snapId: getSnapId(GET_ENTROPY_SNAP_ID, GET_ENTROPY_PORT),
      method: 'signMessage',
      params: {
        message,
      },
    }).catch(logError);
  };

  return (
    <>
      <Form onSubmit={handleSubmit} className="mb-3">
        <Form.Label>Message</Form.Label>
        <Form.Control
          type="text"
          placeholder="Message"
          value={message}
          onChange={handleChange}
          id="entropyMessage"
          className="mb-3"
        />

        <Button type="submit" id="signEntropyMessage" disabled={isLoading}>
          Sign Message
        </Button>
      </Form>
      <Result>
        <span id="entropySignResult">
          {JSON.stringify(data, null, 2)}
          {JSON.stringify(error, null, 2)}
        </span>
      </Result>
    </>
  );
};
