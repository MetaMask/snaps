import { useTabsContext } from '@chakra-ui/react';
import type { FunctionComponent } from 'react';
import { useEffect } from 'react';

import { useHandler } from '../../../hooks';

/**
 * Resets the tab to the first tab when the handler changes.
 *
 * @returns `null`.
 */
export const ResetTab: FunctionComponent = () => {
  const handler = useHandler();
  const tab = useTabsContext();

  useEffect(() => {
    tab.setSelectedIndex(0);
  }, [handler, tab]);

  return null;
};
