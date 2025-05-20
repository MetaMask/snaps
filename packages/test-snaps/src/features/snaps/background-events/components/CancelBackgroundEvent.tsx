import { logError } from '@metamask/snaps-utils';
import type { ChangeEvent, FormEvent, FunctionComponent } from 'react';
import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';

import { useInvokeMutation } from '../../../../api';
import { getSnapId } from '../../../../utils';
import {
  BACKGROUND_EVENTS_SNAP_PORT,
  BACKGROUND_EVENTS_SNAP_ID,
} from '../constants';

export const CancelBackgroundEvent: FunctionComponent = () => {
  const [id, setId] = useState('');
  const [invokeSnap, { isLoading }] = useInvokeMutation();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setId(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    invokeSnap({
      snapId: getSnapId(BACKGROUND_EVENTS_SNAP_ID, BACKGROUND_EVENTS_SNAP_PORT),
      method: 'cancelDialog',
      params: {
        id,
      },
    }).catch(logError);
  };

  return (
    <>
      <Form onSubmit={handleSubmit} className="mb-3">
        <Form.Group>
          <Form.Label htmlFor="backgroundEventId">
            Background event id
          </Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter background event id"
            value={id}
            onChange={handleChange}
            id="backgroundEventId"
            className="mb-3"
          />
        </Form.Group>

        <Button type="submit" id="cancelBackgroundEvent" disabled={isLoading}>
          Cancel background event (notification)
        </Button>
      </Form>
    </>
  );
};
