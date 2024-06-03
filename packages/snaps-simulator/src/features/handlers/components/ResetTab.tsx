import { useTabsContext } from '@chakra-ui/react';
import type { FunctionComponent } from 'react';
import { useEffect } from 'react';
import { getUserInterface } from 'src/features/simulation';

import { useHandler, useSelector } from '../../../hooks';

/**
 * Resets the tab to the first tab when the handler changes.
 *
 * @returns `null`.
 */
export const ResetTab: FunctionComponent = () => {
  const handler = useHandler();
  const tab = useTabsContext();
  const ui = useSelector(getUserInterface);

  useEffect(() => {
    if (ui) {
      return;
    }

    tab.setSelectedIndex(0);
  }, [handler, tab, ui]);

  return null;
};
