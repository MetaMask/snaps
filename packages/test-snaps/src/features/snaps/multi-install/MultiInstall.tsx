import { logError } from '@metamask/snaps-utils';
import type { FunctionComponent } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';

import { useInstallSnapsMutation } from '../../../api';
import { Snap } from '../../../components';
import { getSnapId } from '../../../utils';
import {
  BIP_32_SNAP_ID,
  BIP_32_PORT,
  BIP_32_VERSION,
} from '../bip32/constants';
import {
  BIP_44_SNAP_ID,
  BIP_44_PORT,
  BIP_44_VERSION,
} from '../bip44/constants';

export const MultiInstall: FunctionComponent = () => {
  const [installSnaps, { isLoading }] = useInstallSnapsMutation();

  const handleInstall = () => {
    installSnaps({
      [getSnapId(BIP_32_SNAP_ID, BIP_32_PORT)]: { version: BIP_32_VERSION },
      [getSnapId(BIP_44_SNAP_ID, BIP_44_PORT)]: { version: BIP_44_VERSION },
    }).catch(logError);
  };

  return (
    <Snap
      name="Multi Install"
      snapId={BIP_32_SNAP_ID}
      version={BIP_32_VERSION}
      testId="multi-install"
      hideConnect={true}
    >
      <ButtonGroup>
        <Button
          disabled={isLoading}
          onClick={handleInstall}
          id="multi-install-connect"
        >
          Install Snaps
        </Button>
      </ButtonGroup>
    </Snap>
  );
};
