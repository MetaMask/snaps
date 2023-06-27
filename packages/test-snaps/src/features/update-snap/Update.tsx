import { FunctionComponent } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';

import { useGetSnapsQuery, useInstallSnapMutation } from '../../api';
import { Result, Snap } from '../../components';

const UPDATE_SNAP_ID = 'npm:@metamask/test-snap-bip32';
const UPDATE_SNAP_OLD_VERSION = '5.1.1';
const UPDATE_SNAP_NEW_VERSION = '5.1.2';

export const Update: FunctionComponent = () => {
  const [installSnap, { isLoading }] = useInstallSnapMutation();
  const { data: snaps } = useGetSnapsQuery();

  const currentVersion = snaps?.[UPDATE_SNAP_ID]?.version;

  const handleUpdate = () => {
    installSnap({
      snapId: UPDATE_SNAP_ID,
      version: UPDATE_SNAP_NEW_VERSION,
    });
  };

  return (
    <Snap
      name="Update Snap"
      snapId={UPDATE_SNAP_ID}
      version={UPDATE_SNAP_OLD_VERSION}
      testId="Update"
    >
      <Result className="mb-3">
        <span id="updateSnapVersion">
          {JSON.stringify(currentVersion, null, 2)}
        </span>
      </Result>

      <ButtonGroup>
        <Button
          disabled={isLoading}
          onClick={handleUpdate}
          id="connectUpdateNew"
        >
          Update Snap
        </Button>
      </ButtonGroup>
    </Snap>
  );
};
