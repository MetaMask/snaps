import { logError } from '@metamask/snaps-utils';
import type { CaipChainId } from '@metamask/utils';
import type { ChangeEvent, FormEvent, FunctionComponent } from 'react';
import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';

import { useInvokeMutation } from '../../../../api';
import { Result } from '../../../../components';
import { getSnapId } from '../../../../utils';
import {
  MULTICHAIN_PROVIDER_SNAP_ID,
  MULTICHAIN_PROVIDER_SNAP_PORT,
} from '../constants';

export type SignMessageProps = {
  scope: CaipChainId;
};

export const SignMessage: FunctionComponent<SignMessageProps> = ({ scope }) => {
  const [message, setMessage] = useState('');
  const [invokeSnap, { isLoading, data, error }] = useInvokeMutation();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    invokeSnap({
      snapId: getSnapId(
        MULTICHAIN_PROVIDER_SNAP_ID,
        MULTICHAIN_PROVIDER_SNAP_PORT,
      ),
      method: 'signMessage',
      params: {
        message,
        scope,
      },
    }).catch(logError);
  };

  return (
    <>
      <h3 className="h5">Message Signing</h3>
      <Form onSubmit={handleSubmit} className="mb-3">
        <Form.Label>Message</Form.Label>
        <Form.Control
          type="text"
          placeholder="Message"
          value={message}
          onChange={handleChange}
          id="signMessageMultichain"
          className="mb-3"
        />

        <Button
          type="submit"
          id="signMessageMultichainButton"
          disabled={isLoading}
        >
          Sign Message
        </Button>
      </Form>
      <Result className="mb-3">
        <span id="signMessageMultichainResult">
          {JSON.stringify(data, null, 2)}
          {JSON.stringify(error, null, 2)}
        </span>
      </Result>
    </>
  );
};
