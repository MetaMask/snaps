import { ChangeEvent, FormEvent, FunctionComponent, useState } from 'react';
import { Button, Form } from 'react-bootstrap';

import { useInvokeMutation } from '../../api';
import { Result } from '../../components';
import { getSnapId } from '../../utils/id';
import { SNAP_ID, SNAP_PORT } from './WebAssembly';

export const FibonacciInput: FunctionComponent = () => {
  const [message, setMessage] = useState('');
  const [invokeSnap, { isLoading, data }] = useInvokeMutation();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    invokeSnap({
      snapId: getSnapId(SNAP_ID, SNAP_PORT),
      method: 'fib',
      params: [message],
    });
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
          Send
        </Button>
      </Form>
      <Result>
        <span id="wasmResult">{JSON.stringify(data, null, 2)}</span>
      </Result>
    </>
  );
};
