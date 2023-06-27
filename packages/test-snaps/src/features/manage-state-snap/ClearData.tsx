import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { Tag, useInvokeMutation } from '../../api';
import { Result } from '../../components';
import { MANAGE_STATE_ACTUAL_ID } from './ManageState';

export const ClearData: FunctionComponent = () => {
  const [invokeSnap, { isLoading, data }] = useInvokeMutation();

  const handleClick = () => {
    invokeSnap({
      snapId: MANAGE_STATE_ACTUAL_ID,
      method: 'clearTestData',
      tags: [Tag.TestState],
    });
  };

  return (
    <>
      <Button
        id="clearManageState"
        onClick={handleClick}
        disabled={isLoading}
        className="mb-3"
      >
        Clear Data
      </Button>
      <Result>
        <span id="clearManageStateResult">{JSON.stringify(data, null, 2)}</span>
      </Result>
    </>
  );
};
