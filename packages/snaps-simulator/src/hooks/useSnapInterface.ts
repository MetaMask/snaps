import type { StoredInterface } from '@metamask/snaps-controllers';
import type { SnapId } from '@metamask/snaps-sdk';
import { useEffect, useState } from 'react';
import { getSnapInterfaceController } from 'src/features';

import { useSelector } from './useSelector';

export const useSnapInterface = (snapId: string, interfaceId: string) => {
  const snapInterfaceController = useSelector(getSnapInterfaceController);

  const [snapInterface, setInterface] = useState<StoredInterface | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!interfaceId) {
      return;
    }
    const storedInterface = snapInterfaceController?.getInterface(
      snapId as SnapId,
      interfaceId,
    );
    setInterface(storedInterface);
  }, [snapInterfaceController, snapId, interfaceId]);

  return snapInterface;
};
