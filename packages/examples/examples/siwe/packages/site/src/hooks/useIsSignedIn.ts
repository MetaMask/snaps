import { useCallback, useEffect, useState } from 'react';
import { checkIsSignedIn } from '../utils';

export const useIsSignedIn = () => {
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshIsSignedIn = useCallback(async () => {
    if (isRefreshing) {
      return;
    }
    setIsRefreshing(true);
    try {
      setIsSignedIn(await checkIsSignedIn());
    } catch (e) {
      setIsSignedIn(false);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  useEffect(() => {
    if (isSignedIn === null) {
      refreshIsSignedIn();
    }
  }, [isSignedIn, refreshIsSignedIn]);

  return {
    isSignedIn,
    refreshIsSignedIn,
  };
};
