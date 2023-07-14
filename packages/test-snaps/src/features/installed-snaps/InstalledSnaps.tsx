import type { FunctionComponent } from 'react';

import { useGetSnapsQuery } from '../../api';
import { Result, Snap } from '../../components';

export const InstalledSnaps: FunctionComponent = () => {
  const { data: installedSnaps } = useGetSnapsQuery();

  return (
    <Snap name="Installed Snaps" testId="InstalledSnaps" hideConnect={true}>
      <Result>
        <span id="installedSnapsResult">
          {installedSnaps && Object.keys(installedSnaps).length > 0
            ? Object.keys(installedSnaps).join(', ')
            : 'No Snaps installed.'}
        </span>
      </Result>
    </Snap>
  );
};
