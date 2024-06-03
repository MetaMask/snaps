import { useTabsContext } from '@chakra-ui/react';
import type { FunctionComponent } from 'react';
import { useEffect } from 'react';

import { useSelector } from '../../../hooks';
import { getUserInterface } from '../../simulation';

/**
 * Resets the tab to the first tab when the user interface is closed.
 *
 * @returns `null`.
 */
export const ResetUserInterfaceTab: FunctionComponent = () => {
  const userInterface = useSelector(getUserInterface);
  const tab = useTabsContext();

  useEffect(() => {
    if (!userInterface) {
      tab.setSelectedIndex(0);
    }
  }, [userInterface, tab]);

  return null;
};
