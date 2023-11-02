import { logError } from '@metamask/snaps-utils';
import type { ChangeEvent, FormEvent, FunctionComponent } from 'react';
import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';

import { Tag, useInvokeMutation } from '../../../../api';
import { Result } from '../../../../components';
import { getSnapId } from '../../../../utils';
import { MANAGE_STATE_PORT, MANAGE_STATE_SNAP_ID } from '../constants';
import { useSnapState } from '../hooks';

export const SendData: FunctionComponent<{ encrypted: boolean }> = ({
  encrypted,
}) => {
  const [value, setValue] = useState('');
  const [invokeSnap, { isLoading, data, error }] = useInvokeMutation();
  const snapState = useSnapState(encrypted);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    invokeSnap({
      snapId: getSnapId(MANAGE_STATE_SNAP_ID, MANAGE_STATE_PORT),
      method: 'setState',
      params: {
        items: [...snapState.items, value],
        encrypted,
      },
      tags: [encrypted ? Tag.TestState : Tag.UnencryptedTestState],
    }).catch(logError);
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
            id={encrypted ? 'dataManageState' : 'dataUnencryptedManageState'}
            className="mb-3"
          />
        </Form.Group>

        <Button
          type="submit"
          id={encrypted ? 'sendManageState' : 'sendUnencryptedManageState'}
          disabled={isLoading}
        >
          Send Data
        </Button>
      </Form>

      <Result className="mb-3">
        <span
          id={
            encrypted
              ? 'sendManageStateResult'
              : 'sendUnencryptedManageStateResult'
          }
        >
          {JSON.stringify(data, null, 2)}
          {JSON.stringify(error, null, 2)}
        </span>
      </Result>
    </>
  );
};
