import { ChangeEvent, FormEvent, FunctionComponent, useState } from 'react';
import { Button, Form } from 'react-bootstrap';

import { Tag, useInvokeMutation } from '../../api';
import { Result } from '../../components';
import { MANAGE_STATE_ACTUAL_ID } from './ManageState';

export const SendData: FunctionComponent = () => {
  const [value, setValue] = useState('');
  const [invokeSnap, { isLoading, data }] = useInvokeMutation();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    invokeSnap({
      snapId: MANAGE_STATE_ACTUAL_ID,
      method: 'storeTestData',
      params: [value],
      tags: [Tag.TestState],
    });
  };

  return (
    <>
      <Form onSubmit={handleSubmit} className="mb-3">
        <Form.Group>
          <Form.Label>Value</Form.Label>
          <Form.Control
            type="text"
            placeholder="Value"
            value={value}
            onChange={handleChange}
            id="dataManageState"
            className="mb-3"
          />
        </Form.Group>

        <Button type="submit" id="sendManageState" disabled={isLoading}>
          Send Data
        </Button>
      </Form>

      <Result className="mb-3">
        <span id="sendManageStateResult">{JSON.stringify(data, null, 2)}</span>
      </Result>
    </>
  );
};
