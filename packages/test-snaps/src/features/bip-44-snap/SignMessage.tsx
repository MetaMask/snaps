import { ChangeEvent, FormEvent, FunctionComponent, useState } from 'react';
import { Button, Form } from 'react-bootstrap';

import { useInvokeMutation } from '../../api';
import { Result } from '../../components';
import { getSnapId } from '../../utils/id';
import { BIP_44_PORT, BIP_44_SNAP_ID } from './BIP44';

export const SignMessage: FunctionComponent = () => {
  const [message, setMessage] = useState('');
  const [invokeSnap, { isLoading, data }] = useInvokeMutation();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    invokeSnap({
      snapId: getSnapId(BIP_44_SNAP_ID, BIP_44_PORT),
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
          id="bip44Message"
          className="mb-3"
        />

        <Button type="submit" id="signBip44Message" disabled={isLoading}>
          Sign Message
        </Button>
      </Form>
      <Result>
        <span id="bip44SignResult">{JSON.stringify(data, null, 2)}</span>
      </Result>
    </>
  );
};
