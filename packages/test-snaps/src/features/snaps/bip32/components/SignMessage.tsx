import { logError } from '@metamask/snaps-utils';
import type { ChangeEvent, FormEvent, FunctionComponent } from 'react';
import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';

import { useInvokeMutation } from '../../../../api';
import { Result } from '../../../../components';
import { getSnapId } from '../../../../utils';
import { BIP_32_PORT, BIP_32_SNAP_ID } from '../constants';

export type SignMessageProps = {
  curve: 'secp256k1' | 'ed25519';
};

export const SignMessage: FunctionComponent<SignMessageProps> = ({ curve }) => {
  const [message, setMessage] = useState('');
  const [invokeSnap, { isLoading, data, error }] = useInvokeMutation();

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
          {JSON.stringify(error, null, 2)}
        </span>
      </Result>
    </>
  );
};
