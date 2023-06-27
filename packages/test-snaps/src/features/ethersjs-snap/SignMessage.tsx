import { ChangeEvent, FormEvent, FunctionComponent, useState } from 'react';
import { Button, Form } from 'react-bootstrap';

import { useInvokeMutation } from '../../api';
import { Result } from '../../components';
import { getSnapId } from '../../utils/id';
import { ETHERSJS_SNAP_ID, ETHERSJS_PORT } from './Ethersjs';

export const SignMessage: FunctionComponent = () => {
  const [message, setMessage] = useState('');
  const [invokeSnap, { isLoading, data }] = useInvokeMutation();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    invokeSnap({
      snapId: getSnapId(ETHERSJS_SNAP_ID, ETHERSJS_PORT),
      method: 'signMessage',
      params: [message],
    });
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
          id="ethersjsMessage"
          className="mb-3"
        />

        <Button type="submit" id="signEthersjsMessage" disabled={isLoading}>
          Sign Message
        </Button>
      </Form>
      <Result>
        <span id="ethersjsSignResult">{JSON.stringify(data, null, 2)}</span>
      </Result>
    </>
  );
};
