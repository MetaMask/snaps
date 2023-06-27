import { ChangeEvent, FormEvent, FunctionComponent, useState } from 'react';
import { Button, Form } from 'react-bootstrap';

import { useInvokeMutation } from '../../api';
import { Result } from '../../components';
import { getSnapId } from '../../utils/id';
import { BIP_32_PORT, BIP_32_SNAP_ID } from './BIP32';

export type SignMessageProps = {
  curve: 'secp256k1' | 'ed25519';
};

export const SignMessage: FunctionComponent<SignMessageProps> = ({ curve }) => {
  const [message, setMessage] = useState('');
  const [invokeSnap, { isLoading, data }] = useInvokeMutation();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    invokeSnap({
      snapId: getSnapId(BIP_32_SNAP_ID, BIP_32_PORT),
      method: 'signMessage',
      params: {
        message,
        curve,
        path: ['m', "44'", "0'"],
      },
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
          id={`bip32Message-${curve}`}
          className="mb-3"
        />

        <Button type="submit" id={`sendBip32-${curve}`} disabled={isLoading}>
          Sign {curve} Message
        </Button>
      </Form>
      <Result className="mb-3">
        <span id={`bip32MessageResult-${curve}`}>
          {JSON.stringify(data, null, 2)}
        </span>
      </Result>
    </>
  );
};
