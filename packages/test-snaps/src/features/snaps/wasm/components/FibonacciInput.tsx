import { logError } from '@metamask/snaps-utils';
import type { ChangeEvent, FormEvent, FunctionComponent } from 'react';
import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';

import { useInvokeMutation } from '../../../../api';
import { Result } from '../../../../components';
import { getSnapId } from '../../../../utils';
import { WASM_SNAP_ID, WASM_SNAP_PORT } from '../constants';

export const FibonacciInput: FunctionComponent = () => {
  const [message, setMessage] = useState('');
  const [invokeSnap, { isLoading, data, error }] = useInvokeMutation();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    invokeSnap({
      snapId: getSnapId(WASM_SNAP_ID, WASM_SNAP_PORT),
      method: 'fibonacci',
      params: [message],
    }).catch(logError);
  };

  return (
    <>
      <Form onSubmit={handleSubmit} className="mb-3">
        <Form.Label>Input</Form.Label>
        <Form.Control
          type="number"
          placeholder="Input"
          value={message}
          onChange={handleChange}
          id="wasmInput"
          className="mb-3"
        />

        <Button type="submit" id="sendWasmMessage" disabled={isLoading}>
          Calculate
        </Button>
      </Form>
      <Result>
        <span id="wasmResult">
          {JSON.stringify(data, null, 2)}
          {JSON.stringify(error, null, 2)}
        </span>
      </Result>
    </>
  );
};
