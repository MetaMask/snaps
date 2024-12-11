import { logError } from '@metamask/snaps-utils';
import type { ChangeEvent, FormEvent, FunctionComponent } from 'react';
import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';

import { useInvokeMutation } from '../../../../api';
import { Result } from '../../../../components';
import { getSnapId } from '../../../../utils';
import { CRONJOBS_SNAP_PORT, CRONJOBS_SNAP_ID } from '../constants';

export const ScheduleBackgroundEvent: FunctionComponent = () => {
  const [date, setDate] = useState('');
  const [invokeSnap, { isLoading, data, error }] = useInvokeMutation();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDate(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    invokeSnap({
      snapId: getSnapId(CRONJOBS_SNAP_ID, CRONJOBS_SNAP_PORT),
      method: 'scheduleNotification',
      params: {
        date,
      },
    }).catch(logError);
  };

  return (
    <>
      <Form onSubmit={handleSubmit} className="mb-3">
        <Form.Group>
          <Form.Label>Date (must be in IS8601 format)</Form.Label>
          <Form.Control
            type="text"
            placeholder={new Date().toISOString()}
            value={date}
            onChange={handleChange}
            id="backgroundEventDate"
            className="mb-3"
          />
        </Form.Group>

        <Button type="submit" id="scheduleBackgroundEvent" disabled={isLoading}>
          Schedule background event (notification)
        </Button>
      </Form>

      <h3 id="scheduleBackgroundEventResultLabel">Background event id</h3>
      <Result className="mb-3">
        <span id="scheduleBackgroundEventResult">
          {JSON.stringify(data, null, 2)}
          {JSON.stringify(error, null, 2)}
        </span>
      </Result>
    </>
  );
};
